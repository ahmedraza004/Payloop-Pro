import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateReference } from '@/lib/utils';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const cardId = params.id;
    const body = await req.json();
    const { merchantName = 'Apple Store Online', amount = 14.99, merchantCategory = 'Digital Goods' } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid swipe transaction amount' }, { status: 400 });
    }

    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Transaction declined: Virtual Card is frozen or inactive.' }, { status: 400 });
    }

    if (card.currentSpent + numAmount > card.spendingLimit) {
      return NextResponse.json(
        { error: `Transaction declined: Spending limit of $${card.spendingLimit.toFixed(2)} exceeded.` },
        { status: 400 }
      );
    }

    // Get user wallet
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      include: { wallets: true },
    });

    const wallet = userRecord?.wallets[0];
    if (!wallet || wallet.availableBalance < numAmount) {
      return NextResponse.json({ error: 'Transaction declined: Insufficient funds in connected wallet.' }, { status: 400 });
    }

    const ref = generateReference('CRD');

    await prisma.$transaction(async (tx) => {
      // 1. Debit wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: numAmount },
          availableBalance: { decrement: numAmount },
        },
      });

      // 2. Increment card currentSpent
      await tx.virtualCard.update({
        where: { id: card.id },
        data: {
          currentSpent: { increment: numAmount },
        },
      });

      // 3. Record card purchase
      await tx.cardPurchase.create({
        data: {
          cardId: card.id,
          userId: user.id,
          merchantName,
          merchantCategory,
          amount: numAmount,
          currency: 'USD',
          status: 'APPROVED',
        },
      });

      // 4. Record ledger transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId: user.id,
          type: 'CARD_PURCHASE',
          amount: numAmount,
          fee: 0.0,
          currency: 'USD',
          status: 'COMPLETED',
          reference: ref,
          description: `Card ending ${card.last4}: ${merchantName}`,
          riskScore: 'LOW',
        },
      });

      // 5. Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: `Card Purchase Approved (-$${numAmount.toFixed(2)}) 🛍️`,
          message: `$${numAmount.toFixed(2)} charged at ${merchantName} on card •••• ${card.last4}.`,
          type: 'TRANSACTION',
          link: '/dashboard/cards',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Card purchase of $${numAmount.toFixed(2)} at ${merchantName} approved!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
