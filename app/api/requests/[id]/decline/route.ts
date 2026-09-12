import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const requestId = params.id;

    const request = await prisma.moneyRequest.findUnique({
      where: { id: requestId },
      include: { requester: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request is no longer pending' }, { status: 400 });
    }

    await prisma.moneyRequest.update({
      where: { id: requestId },
      data: { status: 'DECLINED' },
    });

    await prisma.notification.create({
      data: {
        userId: request.requesterId,
        title: 'Money Request Declined',
        message: `@${user.username} declined your money request for $${request.amount.toFixed(2)}.`,
        type: 'TRANSACTION',
        link: '/dashboard/requests',
      },
    });

    return NextResponse.json({ success: true, message: 'Request declined' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
