import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateReference } from '@/lib/utils';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const potId = params.id;
    const body = await req.json();
    const { amount, note } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid contribution amount' }, { status: 400 });
    }

    const pot = await prisma.sharedPot.findUnique({
      where: { id: potId },
    });

    if (!pot) {
      return NextResponse.json({ error: 'Shared Pot not found' }, { status: 404 });
    }

    if (pot.status !== 'ACTIVE') {
      return NextResponse.json({ error: `This pot is ${pot.status.toLowerCase()}` }, { status: 400 });
    }

    // Check user wallet balance
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      include: { wallets: true },
    });

    const wallet = userRecord?.wallets.find((w) => w.currency === pot.currency) || userRecord?.wallets[0];
    if (!wallet || wallet.availableBalance < numAmount) {
      return NextResponse.json({ error: 'Insufficient available funds in your wallet' }, { status: 400 });
    }

    const ref = generateReference('POT');

    await prisma.$transaction(async (tx) => {
      // 1. Debit user wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: numAmount },
          availableBalance: { decrement: numAmount },
        },
      });

      // 2. Increment pot amount
      const newAmount = pot.currentAmount + numAmount;
      const isFilled = newAmount >= pot.targetAmount;

      await tx.sharedPot.update({
        where: { id: pot.id },
        data: {
          currentAmount: { increment: numAmount },
          status: isFilled && pot.potType === 'SAVINGS' ? 'FILLED' : 'ACTIVE',
        },
      });

      // 3. Record contribution
      await tx.potContribution.create({
        data: {
          potId: pot.id,
          userId: user.id,
          amount: numAmount,
          currency: pot.currency,
          note,
          status: 'COMPLETED',
        },
      });

      // 4. Record ledger transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId: user.id,
          type: 'POT_CONTRIBUTION',
          amount: numAmount,
          fee: 0.0,
          currency: pot.currency,
          status: 'COMPLETED',
          reference: ref,
          description: `Contribution to Pot "${pot.title}"`,
          riskScore: 'LOW',
        },
      });

      // 5. Notify creator
      if (pot.creatorId !== user.id) {
        await tx.notification.create({
          data: {
            userId: pot.creatorId,
            title: `New Contribution to "${pot.title}" 🎉`,
            message: `@${user.username} contributed $${numAmount.toFixed(2)}. Pot is now $${newAmount.toFixed(2)} / $${pot.targetAmount.toFixed(2)}.`,
            type: 'POT',
            link: '/dashboard/pots',
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Contributed $${numAmount.toFixed(2)} to ${pot.title}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
