import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    const [incomingRequests, outgoingRequests] = await Promise.all([
      prisma.moneyRequest.findMany({
        where: {
          OR: [{ payerId: user.id }, { payerEmail: user.email }],
        },
        include: {
          requester: {
            select: { id: true, name: true, username: true, email: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.moneyRequest.findMany({
        where: { requesterId: user.id },
        include: {
          payer: {
            select: { id: true, name: true, username: true, email: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      incoming: incomingRequests,
      outgoing: outgoingRequests,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { target, amount, note, dueDate, currency = 'USD' } = body;

    if (!target || !amount) {
      return NextResponse.json({ error: 'Recipient target and amount are required' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid amount' }, { status: 400 });
    }

    const cleanTarget = target.toLowerCase().trim().replace('@', '');

    // Check if target matches existing user
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanTarget },
          { username: cleanTarget },
          { wallets: { some: { walletNumber: target } } },
        ],
      },
    });

    if (targetUser && targetUser.id === user.id) {
      return NextResponse.json({ error: 'You cannot request money from yourself' }, { status: 400 });
    }

    const payerEmail = targetUser ? targetUser.email : cleanTarget;

    const request = await prisma.moneyRequest.create({
      data: {
        requesterId: user.id,
        payerId: targetUser ? targetUser.id : null,
        payerEmail,
        amount: numAmount,
        currency,
        note,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING',
      },
    });

    // Notify target user if registered
    if (targetUser) {
      await prisma.notification.create({
        data: {
          userId: targetUser.id,
          title: `Money Request from @${user.username}`,
          message: `@${user.username} requested $${numAmount.toFixed(2)}${note ? ` for "${note}"` : ''}.`,
          type: 'TRANSACTION',
          link: '/dashboard/requests',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Money request for $${numAmount.toFixed(2)} sent to ${target}!`,
      request,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
