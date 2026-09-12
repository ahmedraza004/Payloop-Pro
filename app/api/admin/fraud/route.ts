import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const alerts = await prisma.fraudAlert.findMany({
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true, status: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { alertId, action, freezeUser } = body; // action: 'RESOLVE' | 'DISMISS'

    if (!alertId || !action) {
      return NextResponse.json({ error: 'Alert ID and action are required' }, { status: 400 });
    }

    const alert = await prisma.fraudAlert.findUnique({
      where: { id: alertId },
      include: { user: true },
    });

    if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

    const newStatus = action === 'RESOLVE' ? 'RESOLVED' : 'DISMISSED';

    await prisma.fraudAlert.update({
      where: { id: alert.id },
      data: {
        status: newStatus,
        resolvedBy: admin.id,
        resolvedAt: new Date(),
      },
    });

    if (freezeUser) {
      await prisma.user.update({
        where: { id: alert.userId },
        data: { status: 'FROZEN' },
      });
      await prisma.wallet.updateMany({
        where: { userId: alert.userId },
        data: { status: 'FROZEN' },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Alert marked as ${newStatus}${freezeUser ? ' and user account was frozen.' : '.'}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
