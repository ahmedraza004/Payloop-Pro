import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processTransfer } from '@/lib/ledger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    const schedules = await prisma.recurringPayment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ schedules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const {
      recipientName,
      recipientIdentifier,
      amount,
      frequency = 'MONTHLY',
      currency = 'USD',
      startDate,
      action,
      scheduleId,
    } = body;

    // Trigger immediate manual execution
    if (action === 'EXECUTE_NOW' && scheduleId) {
      const schedule = await prisma.recurringPayment.findFirst({
        where: { id: scheduleId, userId: user.id },
      });

      if (!schedule) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
      }

      await processTransfer({
        senderUserId: user.id,
        receiverIdentifier: schedule.recipientIdentifier,
        amount: schedule.amount,
        currency: schedule.currency,
        note: `Automatic Recurring: ${schedule.recipientName} (${schedule.frequency})`,
      });

      await prisma.recurringPayment.update({
        where: { id: schedule.id },
        data: {
          lastExecuted: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Recurring payment of $${schedule.amount.toFixed(2)} executed successfully!`,
      });
    }

    if (!recipientName || !recipientIdentifier || !amount) {
      return NextResponse.json({ error: 'Recipient name, identifier, and amount are required' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid amount' }, { status: 400 });
    }

    const nextExec = startDate ? new Date(startDate) : new Date(Date.now() + 30 * 86400000);

    const schedule = await prisma.recurringPayment.create({
      data: {
        userId: user.id,
        recipientName,
        recipientIdentifier,
        amount: numAmount,
        currency,
        frequency,
        nextExecution: nextExec,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Recurring payment to ${recipientName} configured successfully!`,
      schedule,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { id, status } = body;

    const schedule = await prisma.recurringPayment.findFirst({
      where: { id, userId: user.id },
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    const updated = await prisma.recurringPayment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
