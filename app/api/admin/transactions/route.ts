import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateReference } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const search = searchParams.get('search')?.trim();

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { reference: { contains: search } },
        { description: { contains: search } },
        { senderWalletNumber: { contains: search } },
        { receiverWalletNumber: { contains: search } },
        { user: { username: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true },
        },
        wallet: {
          select: { walletNumber: true, currency: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { transactionId, reason } = body;

    if (!transactionId) return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });

    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true, wallet: true },
    });

    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    if (tx.status === 'REFUNDED') return NextResponse.json({ error: 'Transaction is already refunded' }, { status: 400 });

    const refundRef = generateReference('RFD');

    await prisma.$transaction(async (prismaTx) => {
      // If it was a debit from user (e.g. TRANSFER_SENT, CARD_PURCHASE, WITHDRAWAL), credit the user back
      const isDebit = ['TRANSFER_SENT', 'CARD_PURCHASE', 'WITHDRAWAL', 'REQUEST_PAID', 'POT_CONTRIBUTION', 'FEE'].includes(tx.type);

      if (isDebit) {
        await prismaTx.wallet.update({
          where: { id: tx.walletId },
          data: {
            balance: { increment: tx.amount },
            availableBalance: { increment: tx.amount },
          },
        });
      }

      // Mark original transaction as REFUNDED
      await prismaTx.transaction.update({
        where: { id: tx.id },
        data: { status: 'REFUNDED' },
      });

      // Create new REFUND ledger record
      await prismaTx.transaction.create({
        data: {
          walletId: tx.walletId,
          userId: tx.userId,
          type: 'REFUND',
          amount: tx.amount,
          fee: 0.0,
          currency: tx.currency,
          status: 'COMPLETED',
          reference: refundRef,
          description: `Admin Refund for ${tx.reference}${reason ? ` (${reason})` : ''}`,
          riskScore: 'LOW',
        },
      });

      // Notify User
      await prismaTx.notification.create({
        data: {
          userId: tx.userId,
          title: `Refund Processed (+$${tx.amount.toFixed(2)}) 💸`,
          message: `Transaction ${tx.reference} was refunded by compliance. Reason: ${reason || 'Customer Resolution'}.`,
          type: 'TRANSACTION',
          link: '/dashboard/transactions',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Transaction ${tx.reference} has been successfully refunded.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
