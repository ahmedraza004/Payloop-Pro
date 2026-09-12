import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateReference } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { plan = 'PRO', billing = 'MONTHLY' } = body;

    const price = billing === 'YEARLY' ? 199.0 : 19.99;

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      include: { wallets: true },
    });

    const wallet = userRecord?.wallets[0];
    if (!wallet || wallet.availableBalance < price) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. You need $${price.toFixed(2)} to upgrade to Pro.` },
        { status: 400 }
      );
    }

    const ref = generateReference('SUB');

    await prisma.$transaction(async (tx) => {
      // 1. Debit wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: price },
          availableBalance: { decrement: price },
          dailyTransferLimit: 100000.0, // Upgrade to $100,000 daily limit
        },
      });

      // 2. Upgrade User Tier
      await tx.user.update({
        where: { id: user.id },
        data: {
          tier: 'PRO',
        },
      });

      // 3. Record transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId: user.id,
          type: 'FEE',
          amount: price,
          fee: 0.0,
          currency: 'USD',
          status: 'COMPLETED',
          reference: ref,
          description: `PayLoop Pro Membership (${billing}) ⚡`,
          riskScore: 'LOW',
        },
      });

      // 4. Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to PayLoop Pro! 💎',
          message: 'Your account has been upgraded with zero withdrawal fees, 10 virtual cards, and $100k daily limits.',
          type: 'SYSTEM',
          link: '/dashboard',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully upgraded to PayLoop Pro!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
