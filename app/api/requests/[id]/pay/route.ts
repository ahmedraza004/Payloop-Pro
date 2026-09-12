import { NextResponse } from 'next/server';
import { requireAuth, comparePin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateReference } from '@/lib/utils';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const requestId = params.id;
    const body = await req.json().catch(() => ({}));
    const { pin } = body;

    const request = await prisma.moneyRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: { include: { wallets: true } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: `Request has already been ${request.status.toLowerCase()}` }, { status: 400 });
    }

    // Verify current user is the payer
    if (request.payerId && request.payerId !== user.id && request.payerEmail !== user.email) {
      return NextResponse.json({ error: 'You are not authorized to pay this request' }, { status: 403 });
    }

    // Check PIN if user has PIN
    if (user.pin) {
      if (!pin) {
        return NextResponse.json({ error: 'Transfer PIN is required to authorize payment', requirePin: true }, { status: 400 });
      }
      const isPinValid = await comparePin(pin, user.pin);
      if (!isPinValid) {
        return NextResponse.json({ error: 'Incorrect Transfer PIN', requirePin: true }, { status: 400 });
      }
    }

    // Payer Wallet
    const payer = await prisma.user.findUnique({
      where: { id: user.id },
      include: { wallets: true },
    });
    const payerWallet = payer?.wallets.find((w) => w.currency === request.currency) || payer?.wallets[0];

    if (!payerWallet || payerWallet.availableBalance < request.amount) {
      return NextResponse.json({ error: 'Insufficient funds in your wallet to pay this request' }, { status: 400 });
    }

    const requesterWallet = request.requester.wallets.find((w) => w.currency === request.currency) || request.requester.wallets[0];
    if (!requesterWallet) {
      return NextResponse.json({ error: 'Requester wallet unavailable' }, { status: 400 });
    }

    const ref = generateReference('REQ');

    // Atomic settlement
    await prisma.$transaction(async (tx) => {
      // 1. Debit payer
      await tx.wallet.update({
        where: { id: payerWallet.id },
        data: {
          balance: { decrement: request.amount },
          availableBalance: { decrement: request.amount },
        },
      });

      // 2. Credit requester
      await tx.wallet.update({
        where: { id: requesterWallet.id },
        data: {
          balance: { increment: request.amount },
          availableBalance: { increment: request.amount },
        },
      });

      // 3. Mark request PAID
      await tx.moneyRequest.update({
        where: { id: request.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          payerId: user.id,
        },
      });

      // 4. Create Ledger Transactions
      await tx.transaction.create({
        data: {
          walletId: payerWallet.id,
          userId: user.id,
          type: 'REQUEST_PAID',
          amount: request.amount,
          fee: 0.0,
          currency: request.currency,
          status: 'COMPLETED',
          reference: `${ref}-OUT`,
          description: `Paid money request to @${request.requester.username}${request.note ? ` (${request.note})` : ''}`,
          senderWalletNumber: payerWallet.walletNumber,
          receiverWalletNumber: requesterWallet.walletNumber,
        },
      });

      await tx.transaction.create({
        data: {
          walletId: requesterWallet.id,
          userId: request.requester.id,
          type: 'REQUEST_RECEIVED',
          amount: request.amount,
          fee: 0.0,
          currency: request.currency,
          status: 'COMPLETED',
          reference: `${ref}-IN`,
          description: `Received requested funds from @${user.username}${request.note ? ` (${request.note})` : ''}`,
          senderWalletNumber: payerWallet.walletNumber,
          receiverWalletNumber: requesterWallet.walletNumber,
        },
      });

      // 5. Notifications
      await tx.notification.create({
        data: {
          userId: request.requester.id,
          title: `Money Request Paid (+$${request.amount.toFixed(2)}) 🎉`,
          message: `@${user.username} paid your request of $${request.amount.toFixed(2)}.`,
          type: 'TRANSACTION',
          link: '/dashboard/transactions',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Successfully paid $${request.amount.toFixed(2)} to @${request.requester.username}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
