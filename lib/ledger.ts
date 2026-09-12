import prisma from './prisma';
import { generateReference } from './utils';
import { evaluateTransactionRisk } from './fraud';

export interface TransferParams {
  senderUserId: string;
  receiverIdentifier: string; // email, username, or walletNumber
  amount: number;
  currency?: string;
  note?: string;
  pinVerified?: boolean;
  twoFactorVerified?: boolean;
  ipAddress?: string;
}

export async function processTransfer(params: TransferParams) {
  const { senderUserId, receiverIdentifier, amount, currency = 'USD', note } = params;

  if (amount <= 0) {
    throw new Error('Transfer amount must be greater than 0');
  }

  // Find sender user & wallet
  const sender = await prisma.user.findUnique({
    where: { id: senderUserId },
    include: { wallets: true },
  });

  if (!sender) throw new Error('Sender account not found');
  if (sender.status !== 'ACTIVE') throw new Error('Sender wallet is not active');

  const senderWallet = sender.wallets.find((w) => w.currency === currency) || sender.wallets[0];
  if (!senderWallet) throw new Error(`No wallet found for currency ${currency}`);
  if (senderWallet.status !== 'ACTIVE') throw new Error('Sender wallet is frozen or suspended');

  if (senderWallet.availableBalance < amount) {
    throw new Error(`Insufficient funds. Available: $${senderWallet.availableBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`);
  }

  // Check Daily Limit
  const today = new Date();
  const lastSpent = new Date(senderWallet.lastSpentDate);
  const isSameDay =
    today.getDate() === lastSpent.getDate() &&
    today.getMonth() === lastSpent.getMonth() &&
    today.getFullYear() === lastSpent.getFullYear();

  const currentDailySpent = isSameDay ? senderWallet.dailySpentToday : 0;
  if (currentDailySpent + amount > senderWallet.dailyTransferLimit) {
    throw new Error(
      `Daily limit exceeded. Limit: $${senderWallet.dailyTransferLimit.toFixed(2)}, Already spent today: $${currentDailySpent.toFixed(2)}`
    );
  }

  // Find Receiver
  const receiver = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: receiverIdentifier.toLowerCase().trim() } },
        { username: { equals: receiverIdentifier.toLowerCase().replace('@', '').trim() } },
        { wallets: { some: { walletNumber: receiverIdentifier.trim() } } },
      ],
    },
    include: { wallets: true },
  });

  if (!receiver) {
    throw new Error(`Recipient "${receiverIdentifier}" was not found.`);
  }

  if (receiver.id === sender.id) {
    throw new Error('You cannot transfer money to yourself.');
  }

  if (receiver.status !== 'ACTIVE') {
    throw new Error('Recipient account is currently unable to accept transfers.');
  }

  const receiverWallet = receiver.wallets.find((w) => w.currency === currency) || receiver.wallets[0];
  if (!receiverWallet) {
    throw new Error('Recipient has no compatible wallet.');
  }

  // Evaluate Fraud & Risk
  const fraudCheck = await evaluateTransactionRisk({
    userId: sender.id,
    amount,
    walletBalance: senderWallet.balance,
    type: 'TRANSFER',
    ipAddress: params.ipAddress,
  });

  if (fraudCheck.shouldBlock) {
    throw new Error('Transaction blocked by security heuristics. Please contact support.');
  }

  const reference = generateReference('TRF');

  // Atomic database transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Debit sender wallet
    const updatedSenderWallet = await tx.wallet.update({
      where: { id: senderWallet.id },
      data: {
        balance: { decrement: amount },
        availableBalance: { decrement: amount },
        dailySpentToday: isSameDay ? { increment: amount } : amount,
        lastSpentDate: today,
      },
    });

    // 2. Credit receiver wallet
    const updatedReceiverWallet = await tx.wallet.update({
      where: { id: receiverWallet.id },
      data: {
        balance: { increment: amount },
        availableBalance: { increment: amount },
      },
    });

    // 3. Create Sender Ledger Transaction
    const senderTx = await tx.transaction.create({
      data: {
        walletId: senderWallet.id,
        userId: sender.id,
        type: 'TRANSFER_SENT',
        amount: amount,
        fee: 0.0,
        currency,
        status: 'COMPLETED',
        reference: `${reference}-OUT`,
        description: `Transfer to @${receiver.username}${note ? ` - ${note}` : ''}`,
        senderWalletNumber: senderWallet.walletNumber,
        receiverWalletNumber: receiverWallet.walletNumber,
        riskScore: fraudCheck.riskScore,
      },
    });

    // 4. Create Receiver Ledger Transaction
    const receiverTx = await tx.transaction.create({
      data: {
        walletId: receiverWallet.id,
        userId: receiver.id,
        type: 'TRANSFER_RECEIVED',
        amount: amount,
        fee: 0.0,
        currency,
        status: 'COMPLETED',
        reference: `${reference}-IN`,
        description: `Transfer from @${sender.username}${note ? ` - ${note}` : ''}`,
        senderWalletNumber: senderWallet.walletNumber,
        receiverWalletNumber: receiverWallet.walletNumber,
        riskScore: fraudCheck.riskScore,
      },
    });

    // 5. Create Transfer Record
    const transferRecord = await tx.transfer.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        amount,
        currency,
        note,
        status: 'COMPLETED',
        transferPinVerified: !!params.pinVerified,
        twoFactorVerified: !!params.twoFactorVerified,
      },
    });

    // 6. Push In-App Notifications
    await tx.notification.create({
      data: {
        userId: receiver.id,
        title: `Payment Received (+$${amount.toFixed(2)}) 💰`,
        message: `@${sender.username} sent you $${amount.toFixed(2)}${note ? ` for "${note}"` : ''}.`,
        type: 'TRANSACTION',
        link: '/dashboard/transactions',
      },
    });

    await tx.notification.create({
      data: {
        userId: sender.id,
        title: `Transfer Sent (-$${amount.toFixed(2)})`,
        message: `Successfully transferred $${amount.toFixed(2)} to @${receiver.username}.`,
        type: 'TRANSACTION',
        link: '/dashboard/transactions',
      },
    });

    return {
      senderTx,
      receiverTx,
      transferRecord,
      newSenderBalance: updatedSenderWallet.availableBalance,
    };
  });

  return result;
}

export async function processDeposit(params: {
  userId: string;
  amount: number;
  currency?: string;
  method?: string;
  stripeSessionId?: string;
}) {
  const { userId, amount, currency = 'USD', method = 'STRIPE', stripeSessionId } = params;

  if (amount <= 0) throw new Error('Deposit amount must be positive');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallets: true },
  });

  if (!user) throw new Error('User not found');
  const wallet = user.wallets.find((w) => w.currency === currency) || user.wallets[0];
  if (!wallet) throw new Error('Wallet not found');

  const reference = generateReference('DEP');

  return await prisma.$transaction(async (tx) => {
    // 1. Credit wallet
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amount },
        availableBalance: { increment: amount },
      },
    });

    // 2. Create Deposit Record
    const deposit = await tx.deposit.create({
      data: {
        walletId: wallet.id,
        userId: user.id,
        amount,
        netAmount: amount,
        fee: 0.0,
        currency,
        method,
        stripeSessionId,
        status: 'COMPLETED',
      },
    });

    // 3. Create Ledger Transaction
    const transaction = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        userId: user.id,
        type: 'DEPOSIT',
        amount,
        fee: 0.0,
        currency,
        status: 'COMPLETED',
        reference,
        description: `Deposit via ${method === 'STRIPE' ? 'Stripe Checkout' : method}`,
        riskScore: 'LOW',
      },
    });

    // 4. Notification
    await tx.notification.create({
      data: {
        userId: user.id,
        title: `Deposit Confirmed (+$${amount.toFixed(2)}) 💳`,
        message: `Your wallet ${wallet.walletNumber} has been credited with $${amount.toFixed(2)}.`,
        type: 'TRANSACTION',
        link: '/dashboard/transactions',
      },
    });

    return { updatedWallet, deposit, transaction };
  });
}

export async function processWithdrawal(params: {
  userId: string;
  amount: number;
  bankAccountId: string;
  currency?: string;
}) {
  const { userId, amount, bankAccountId, currency = 'USD' } = params;

  if (amount <= 0) throw new Error('Withdrawal amount must be positive');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallets: true, bankAccounts: true },
  });

  if (!user) throw new Error('User not found');

  const wallet = user.wallets.find((w) => w.currency === currency) || user.wallets[0];
  if (!wallet) throw new Error('Wallet not found');

  const bankAccount = user.bankAccounts.find((b) => b.id === bankAccountId);
  if (!bankAccount) throw new Error('Selected bank account not found');

  // Fee calculation (Free for PRO, 1.5% for FREE)
  const fee = user.tier === 'PRO' ? 0.0 : +(amount * 0.015).toFixed(2);
  const totalDeduction = +(amount + fee).toFixed(2);

  if (wallet.availableBalance < totalDeduction) {
    throw new Error(`Insufficient funds. Amount + Fee = $${totalDeduction.toFixed(2)}, Available: $${wallet.availableBalance.toFixed(2)}`);
  }

  const reference = generateReference('WTH');

  return await prisma.$transaction(async (tx) => {
    // 1. Debit wallet
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: totalDeduction },
        availableBalance: { decrement: totalDeduction },
      },
    });

    // 2. Create Withdrawal Record
    const withdrawal = await tx.withdrawal.create({
      data: {
        walletId: wallet.id,
        userId: user.id,
        bankAccountId: bankAccount.id,
        amount,
        fee,
        netAmount: amount,
        currency,
        status: 'PROCESSING',
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber,
        iban: bankAccount.iban,
      },
    });

    // 3. Create Ledger Transaction
    const transaction = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        userId: user.id,
        type: 'WITHDRAWAL',
        amount: totalDeduction,
        fee,
        currency,
        status: 'PROCESSING',
        reference,
        description: `Withdrawal to ${bankAccount.bankName} (${bankAccount.accountNumber})`,
        riskScore: 'LOW',
      },
    });

    // 4. Notification
    await tx.notification.create({
      data: {
        userId: user.id,
        title: `Withdrawal Initiated (-$${amount.toFixed(2)}) 🏦`,
        message: `Your withdrawal of $${amount.toFixed(2)} to ${bankAccount.bankName} is currently processing.`,
        type: 'TRANSACTION',
        link: '/dashboard/transactions',
      },
    });

    return { updatedWallet, withdrawal, transaction };
  });
}
