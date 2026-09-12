import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Fetch unread notifications count
    const unreadNotifications = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    // Fetch pending incoming money requests count
    const pendingRequests = await prisma.moneyRequest.count({
      where: { payerId: user.id, status: 'PENDING' },
    });

    // Fetch virtual cards count
    const virtualCardsCount = await prisma.virtualCard.count({
      where: { userId: user.id, status: 'ACTIVE' },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        tier: user.tier,
        kycLevel: user.kycLevel,
        hasPin: !!user.pin,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
      },
      wallets: user.wallets,
      kycRecord: user.kycRecord,
      metrics: {
        unreadNotifications,
        pendingRequests,
        virtualCardsCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
