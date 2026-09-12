import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PayLoop Pro database...');

  // Clean existing tables in correct order
  await prisma.fraudAlert.deleteMany();
  await prisma.securityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.recurringPayment.deleteMany();
  await prisma.cardPurchase.deleteMany();
  await prisma.virtualCard.deleteMany();
  await prisma.potContribution.deleteMany();
  await prisma.sharedPot.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.moneyRequest.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.kYC.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  const hashedPasswordAdmin = await bcrypt.hash('Admin@12345', 10);
  const hashedPasswordUser = await bcrypt.hash('User@12345', 10);
  const hashedPin = await bcrypt.hash('123456', 10);

  // 1. Super Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'Alexander Wright',
      username: 'admin',
      email: 'admin@payloop.com',
      password: hashedPasswordAdmin,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 019-2834',
      pin: hashedPin,
      status: 'ACTIVE',
      tier: 'PRO',
      kycLevel: 'LEVEL_3',
      twoFactorEnabled: false,
    },
  });

  // Admin Wallet
  const adminWallet = await prisma.wallet.create({
    data: {
      userId: adminUser.id,
      walletNumber: 'PL-9900-8800',
      balance: 150000.0,
      availableBalance: 150000.0,
      lockedBalance: 0.0,
      currency: 'USD',
      dailyTransferLimit: 100000.0,
    },
  });

  // 2. Pro User (Ahmed Raza)
  const proUser = await prisma.user.create({
    data: {
      name: 'Ahmed Raza',
      username: 'ahmedraza',
      email: 'pro@payloop.com',
      password: hashedPasswordUser,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 432-8812',
      pin: hashedPin,
      status: 'ACTIVE',
      tier: 'PRO',
      kycLevel: 'LEVEL_2',
      twoFactorEnabled: true,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP', // Base32 test secret
    },
  });

  const proWallet = await prisma.wallet.create({
    data: {
      userId: proUser.id,
      walletNumber: 'PL-7842-9912',
      balance: 14850.50,
      availableBalance: 13350.50,
      lockedBalance: 1500.00,
      currency: 'USD',
      dailyTransferLimit: 10000.0,
    },
  });

  // 3. Standard User (Sarah Connor)
  const standardUser = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      username: 'sarahc',
      email: 'user@payloop.com',
      password: hashedPasswordUser,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      phone: '+1 (555) 902-1144',
      pin: hashedPin,
      status: 'ACTIVE',
      tier: 'FREE',
      kycLevel: 'LEVEL_1',
      twoFactorEnabled: false,
    },
  });

  const standardWallet = await prisma.wallet.create({
    data: {
      userId: standardUser.id,
      walletNumber: 'PL-3321-4490',
      balance: 2450.00,
      availableBalance: 2450.00,
      lockedBalance: 0.00,
      currency: 'USD',
      dailyTransferLimit: 1000.0,
    },
  });

  // 4. Friend / Recipient Users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Henderson',
      username: 'alice',
      email: 'alice@payloop.com',
      password: hashedPasswordUser,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      pin: hashedPin,
      status: 'ACTIVE',
      tier: 'FREE',
      kycLevel: 'LEVEL_2',
    },
  });

  const aliceWallet = await prisma.wallet.create({
    data: {
      userId: alice.id,
      walletNumber: 'PL-1102-5532',
      balance: 4120.00,
      availableBalance: 4120.00,
      lockedBalance: 0.0,
      currency: 'USD',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Miller',
      username: 'bobm',
      email: 'bob@payloop.com',
      password: hashedPasswordUser,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      pin: hashedPin,
      status: 'ACTIVE',
      tier: 'PRO',
      kycLevel: 'LEVEL_1',
    },
  });

  const bobWallet = await prisma.wallet.create({
    data: {
      userId: bob.id,
      walletNumber: 'PL-8891-2244',
      balance: 6200.00,
      availableBalance: 6200.00,
      lockedBalance: 0.0,
      currency: 'USD',
    },
  });

  // KYC Records
  await prisma.kYC.create({
    data: {
      userId: proUser.id,
      level: 'LEVEL_2',
      status: 'APPROVED',
      firstName: 'Ahmed',
      lastName: 'Raza',
      dob: '1998-05-14',
      address: '742 Evergreen Terrace',
      city: 'San Francisco',
      country: 'United States',
      postalCode: '94103',
      idType: 'PASSPORT',
      idNumber: 'P88492019',
      idFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80',
      reviewedBy: adminUser.id,
      reviewedAt: new Date(),
      submittedAt: new Date(Date.now() - 7 * 86400000),
    },
  });

  await prisma.kYC.create({
    data: {
      userId: standardUser.id,
      level: 'LEVEL_1',
      status: 'APPROVED',
      firstName: 'Sarah',
      lastName: 'Connor',
      dob: '2001-11-22',
      address: '100 Cyberdyne Ave',
      city: 'Los Angeles',
      country: 'United States',
      postalCode: '90001',
      submittedAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  await prisma.kYC.create({
    data: {
      userId: bob.id,
      level: 'LEVEL_2',
      status: 'PENDING',
      firstName: 'Bob',
      lastName: 'Miller',
      dob: '1995-03-10',
      address: '45 Wall St Suite 12',
      city: 'New York',
      country: 'United States',
      postalCode: '10005',
      idType: 'NATIONAL_ID',
      idNumber: 'US-99182374',
      idFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      submittedAt: new Date(Date.now() - 3600000 * 4),
    },
  });

  // Bank Accounts
  const proBank = await prisma.bankAccount.create({
    data: {
      userId: proUser.id,
      bankName: 'JPMorgan Chase & Co.',
      accountHolderName: 'Ahmed Raza',
      accountNumber: '•••• •••• 9821',
      routingNumber: '021000021',
      iban: 'US89CHAS0210000219821',
      isDefault: true,
      isVerified: true,
    },
  });

  await prisma.bankAccount.create({
    data: {
      userId: standardUser.id,
      bankName: 'Bank of America',
      accountHolderName: 'Sarah Connor',
      accountNumber: '•••• •••• 4410',
      routingNumber: '121000358',
      iban: 'US44BOFA1210003584410',
      isDefault: true,
      isVerified: true,
    },
  });

  // Virtual Cards for Pro User
  await prisma.virtualCard.create({
    data: {
      userId: proUser.id,
      cardHolder: 'AHMED RAZA',
      cardNumber: '4532 8891 0042 7731',
      last4: '7731',
      expiryMonth: 8,
      expiryYear: 2029,
      cvv: '629',
      cardType: 'VISA',
      cardSkin: 'NEON_CYAN',
      status: 'ACTIVE',
      spendingLimit: 5000.0,
      currentSpent: 840.25,
      isContactless: true,
      isOnlineActive: true,
    },
  });

  await prisma.virtualCard.create({
    data: {
      userId: proUser.id,
      cardHolder: 'AHMED RAZA (BUSINESS)',
      cardNumber: '5241 6610 9920 1845',
      last4: '1845',
      expiryMonth: 12,
      expiryYear: 2030,
      cvv: '391',
      cardType: 'MASTERCARD',
      cardSkin: 'PLATINUM_CARBON',
      status: 'ACTIVE',
      spendingLimit: 15000.0,
      currentSpent: 2450.00,
      isContactless: true,
      isOnlineActive: true,
    },
  });

  // Shared Pots
  const savingsPot = await prisma.sharedPot.create({
    data: {
      creatorId: proUser.id,
      title: 'Tokyo Summer Trip 2027',
      description: 'Group savings pot for flights, Airbnb in Shibuya, and bullet train passes.',
      targetAmount: 5000.0,
      currentAmount: 2800.0,
      currency: 'USD',
      potType: 'SAVINGS',
      status: 'ACTIVE',
      lockUntil: new Date('2027-06-01'),
    },
  });

  await prisma.potContribution.create({
    data: {
      potId: savingsPot.id,
      userId: proUser.id,
      amount: 1500.0,
      currency: 'USD',
      note: 'Initial flight deposit',
    },
  });

  await prisma.potContribution.create({
    data: {
      potId: savingsPot.id,
      userId: alice.id,
      amount: 800.0,
      currency: 'USD',
      note: 'Airbnb share',
    },
  });

  await prisma.potContribution.create({
    data: {
      potId: savingsPot.id,
      userId: bob.id,
      amount: 500.0,
      currency: 'USD',
      note: 'Shinkansen pass budget',
    },
  });

  // Escrow Pot
  const escrowPot = await prisma.sharedPot.create({
    data: {
      creatorId: proUser.id,
      title: 'Full-Stack Fintech App Development Contract',
      description: 'Milestone 1 Escrow: Frontend & Ledger API Architecture Delivery',
      targetAmount: 3500.0,
      currentAmount: 3500.0,
      currency: 'USD',
      potType: 'ESCROW',
      status: 'ACTIVE',
      escrowBuyerId: proUser.id,
      escrowSellerId: alice.id,
      escrowStatus: 'HOLDING',
    },
  });

  // Recurring Payments
  await prisma.recurringPayment.create({
    data: {
      userId: proUser.id,
      recipientName: 'AWS Cloud Hosting Services',
      recipientIdentifier: 'billing@amazon.com',
      amount: 129.99,
      currency: 'USD',
      frequency: 'MONTHLY',
      nextExecution: new Date(Date.now() + 12 * 86400000),
      lastExecuted: new Date(Date.now() - 18 * 86400000),
      status: 'ACTIVE',
    },
  });

  await prisma.recurringPayment.create({
    data: {
      userId: proUser.id,
      recipientName: 'Office Rent - WeWork Studio',
      recipientIdentifier: 'PL-9900-8800',
      amount: 850.00,
      currency: 'USD',
      frequency: 'MONTHLY',
      nextExecution: new Date(Date.now() + 5 * 86400000),
      lastExecuted: new Date(Date.now() - 25 * 86400000),
      status: 'ACTIVE',
    },
  });

  // Transactions & Ledger for Pro User
  const txHistory = [
    {
      walletId: proWallet.id,
      userId: proUser.id,
      type: 'DEPOSIT',
      amount: 10000.0,
      fee: 0.0,
      currency: 'USD',
      status: 'COMPLETED',
      reference: 'DEP-2026-884910',
      description: 'Stripe Card Deposit (Verified Tier 2)',
      riskScore: 'LOW',
      createdAt: new Date(Date.now() - 10 * 86400000),
    },
    {
      walletId: proWallet.id,
      userId: proUser.id,
      type: 'TRANSFER_SENT',
      amount: 450.0,
      fee: 0.0,
      currency: 'USD',
      status: 'COMPLETED',
      reference: 'TXN-9941203',
      description: 'Transfer to @alice for Design Assets',
      receiverWalletNumber: aliceWallet.walletNumber,
      senderWalletNumber: proWallet.walletNumber,
      riskScore: 'LOW',
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      walletId: proWallet.id,
      userId: proUser.id,
      type: 'TRANSFER_RECEIVED',
      amount: 3200.0,
      fee: 0.0,
      currency: 'USD',
      status: 'COMPLETED',
      reference: 'TXN-7741992',
      description: 'Payment from @bobm for SaaS Consulting',
      senderWalletNumber: bobWallet.walletNumber,
      receiverWalletNumber: proWallet.walletNumber,
      riskScore: 'LOW',
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      walletId: proWallet.id,
      userId: proUser.id,
      type: 'CARD_PURCHASE',
      amount: 84.50,
      fee: 0.0,
      currency: 'USD',
      status: 'COMPLETED',
      reference: 'CRD-002918',
      description: 'Virtual Card Purchase: Apple Subscriptions',
      riskScore: 'LOW',
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      walletId: proWallet.id,
      userId: proUser.id,
      type: 'POT_CONTRIBUTION',
      amount: 1500.0,
      fee: 0.0,
      currency: 'USD',
      status: 'COMPLETED',
      reference: 'POT-TOKYO-01',
      description: 'Contribution to Shared Pot: Tokyo Summer Trip 2027',
      riskScore: 'LOW',
      createdAt: new Date(Date.now() - 1 * 86400000),
    },
    {
      walletId: proWallet.id,
      userId: proUser.id,
      type: 'DEPOSIT',
      amount: 5000.0,
      fee: 0.0,
      currency: 'USD',
      status: 'COMPLETED',
      reference: 'DEP-2026-991204',
      description: 'Instant Wire Transfer Deposit',
      riskScore: 'LOW',
      createdAt: new Date(Date.now() - 86400000 * 0.5),
    },
  ];

  for (const tx of txHistory) {
    await prisma.transaction.create({ data: tx });
  }

  // Money Requests
  await prisma.moneyRequest.create({
    data: {
      requesterId: proUser.id,
      payerId: standardUser.id,
      payerEmail: standardUser.email,
      amount: 150.0,
      currency: 'USD',
      note: 'Dinner & Uber Split from last Friday',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 3 * 86400000),
    },
  });

  await prisma.moneyRequest.create({
    data: {
      requesterId: alice.id,
      payerId: proUser.id,
      payerEmail: proUser.email,
      amount: 75.0,
      currency: 'USD',
      note: 'Team coffee run & snacks',
      status: 'PENDING',
      dueDate: new Date(Date.now() + 2 * 86400000),
    },
  });

  // Notifications
  const notifications = [
    {
      userId: proUser.id,
      title: 'KYC Verification Approved 🎉',
      message: 'Your Tier 2 Identity verification was reviewed and approved. Daily transfer limit increased to $10,000.',
      type: 'KYC',
      isRead: false,
      link: '/dashboard/kyc',
    },
    {
      userId: proUser.id,
      title: 'Incoming Money Request',
      message: 'Alice Henderson requested $75.00 for "Team coffee run & snacks".',
      type: 'TRANSACTION',
      isRead: false,
      link: '/dashboard/requests',
    },
    {
      userId: proUser.id,
      title: 'Shared Pot Update',
      message: 'Bob Miller contributed $500.00 to Tokyo Summer Trip 2027. Pot is now 56% filled!',
      type: 'POT',
      isRead: true,
      link: '/dashboard/pots',
    },
    {
      userId: proUser.id,
      title: 'Security Alert: New Sign-in',
      message: 'Signed in from Chrome on Windows (IP: 192.168.1.45, San Francisco, US).',
      type: 'SECURITY',
      isRead: true,
      link: '/dashboard/security',
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }

  // Security Logs
  await prisma.securityLog.create({
    data: {
      userId: proUser.id,
      event: 'LOGIN',
      ipAddress: '192.168.1.45',
      device: 'Desktop',
      browser: 'Chrome 128.0',
      os: 'Windows 11',
      location: 'San Francisco, United States',
      riskLevel: 'LOW',
      status: 'SUCCESS',
    },
  });

  await prisma.securityLog.create({
    data: {
      userId: proUser.id,
      event: 'TWO_FACTOR_TOGGLE',
      ipAddress: '192.168.1.45',
      device: 'Desktop',
      browser: 'Chrome 128.0',
      os: 'Windows 11',
      location: 'San Francisco, United States',
      riskLevel: 'LOW',
      status: 'SUCCESS',
    },
  });

  // Fraud Alert for Admin Demo
  await prisma.fraudAlert.create({
    data: {
      userId: standardUser.id,
      ruleTriggered: 'RAPID_TRANSFER_VELOCITY',
      riskScore: 'HIGH',
      details: 'User attempted 4 outbound transfers totaling $3,900 within 2 minutes from unfamiliar device.',
      status: 'OPEN',
    },
  });

  console.log('Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS CREATED:');
  console.log('1. Admin:    admin@payloop.com  / Admin@12345 (PIN: 123456)');
  console.log('2. Pro User: pro@payloop.com    / User@12345  (PIN: 123456)');
  console.log('3. User:     user@payloop.com   / User@12345  (PIN: 123456)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
