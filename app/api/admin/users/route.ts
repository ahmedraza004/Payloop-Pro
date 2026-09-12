import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      include: {
        wallets: true,
        kycRecord: true,
        _count: {
          select: {
            transactions: true,
            virtualCards: true,
            fraudAlerts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { userId, status, role, tier, kycLevel } = body;

    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const updateData: any = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    if (tier) updateData.tier = tier;
    if (kycLevel) updateData.kycLevel = kycLevel;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Also update wallet status if account is frozen/active
    if (status) {
      await prisma.wallet.updateMany({
        where: { userId },
        data: { status },
      });
    }

    return NextResponse.json({
      success: true,
      message: `User @${updatedUser.username} updated successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
