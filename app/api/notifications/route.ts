import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId, userId: user.id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: 'Marked as read' });
    }

    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
