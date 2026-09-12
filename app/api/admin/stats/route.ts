import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalTransactions,
      allTransactions,
      pendingKycCount,
      openFraudAlertsCount,
      activePotsCount,
      activeCardsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.transaction.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, fee: true, type: true, createdAt: true },
      }),
      prisma.kYC.count({ where: { status: 'PENDING' } }),
      prisma.fraudAlert.count({ where: { status: 'OPEN' } }),
      prisma.sharedPot.count({ where: { status: 'ACTIVE' } }),
      prisma.virtualCard.count({ where: { status: 'ACTIVE' } }),
    ]);

    const totalVolume = allTransactions.reduce((acc, t) => acc + t.amount, 0);
    const totalRevenue = allTransactions.reduce((acc, t) => acc + (t.fee || 0), 0) + 1250.0; // Base platform fees

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTransactions,
        totalVolume,
        totalRevenue,
        pendingKycCount,
        openFraudAlertsCount,
        activePotsCount,
        activeCardsCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
