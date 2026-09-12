import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateReference } from '@/lib/utils';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const potId = params.id;
    const body = await req.json().catch(() => ({}));
    const { winnerId } = body;

    const pot = await prisma.sharedPot.findUnique({
      where: { id: potId },
      include: {
        contributions: true,
      },
    });

    if (!pot) return NextResponse.json({ error: 'Pot not found' }, { status: 404 });
    if (pot.status === 'SETTLED') return NextResponse.json({ error: 'Pot is already settled' }, { status: 400 });

    if (pot.creatorId !== user.id && pot.escrowBuyerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You are not authorized to settle this pot' }, { status: 403 });
    }

    let recipientUserId = pot.creatorId;

    if (pot.potType === 'ESCROW') {
      if (!pot.escrowSellerId) {
        return NextResponse.json({ error: 'Escrow pot has no designated seller recipient' }, { status: 400 });
      }
      recipientUserId = pot.escrowSellerId;
    } else if (pot.potType === 'BETTING_SIMULATION') {
      if (winnerId) {
        recipientUserId = winnerId;
      } else if (pot.contributions.length > 0) {
        // Randomly pick a contributor as the winner simulation
        const randomIdx = Math.floor(Math.random() * pot.contributions.length);
        recipientUserId = pot.contributions[randomIdx].userId;
      }
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientUserId },
      include: { wallets: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
    }

    const recipientWallet = recipient.wallets.find((w) => w.currency === pot.currency) || recipient.wallets[0];
    if (!recipientWallet) {
      return NextResponse.json({ error: 'Recipient has no valid wallet' }, { status: 400 });
    }

    const payoutAmount = pot.currentAmount;
    const ref = generateReference('STL');

    await prisma.$transaction(async (tx) => {
      // 1. Credit recipient wallet
      await tx.wallet.update({
        where: { id: recipientWallet.id },
        data: {
          balance: { increment: payoutAmount },
          availableBalance: { increment: payoutAmount },
        },
      });

      // 2. Mark Pot Settled
      await tx.sharedPot.update({
        where: { id: pot.id },
        data: {
          status: 'SETTLED',
          winnerId: recipientUserId,
          escrowStatus: pot.potType === 'ESCROW' ? 'RELEASED' : undefined,
        },
      });

      // 3. Create Ledger Transaction
      await tx.transaction.create({
        data: {
          walletId: recipientWallet.id,
          userId: recipient.id,
          type: 'POT_PAYOUT',
          amount: payoutAmount,
          fee: 0.0,
          currency: pot.currency,
          status: 'COMPLETED',
          reference: ref,
          description: `Payout settlement from Pot "${pot.title}" 🏆`,
          riskScore: 'LOW',
        },
      });

      // 4. Send Notification
      await tx.notification.create({
        data: {
          userId: recipient.id,
          title: `Pot Settlement Payout (+$${payoutAmount.toFixed(2)}) 🏆`,
          message: `You received the full settlement payout of $${payoutAmount.toFixed(2)} from "${pot.title}".`,
          type: 'POT',
          link: '/dashboard/pots',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Pot "${pot.title}" successfully settled! $${payoutAmount.toFixed(2)} paid to @${recipient.username}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
