import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const cardId = params.id;
    const body = await req.json();
    const { status, spendingLimit } = body;

    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (spendingLimit !== undefined) updateData.spendingLimit = parseFloat(spendingLimit);

    const updatedCard = await prisma.virtualCard.update({
      where: { id: card.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: status === 'FROZEN' ? 'Card frozen' : status === 'ACTIVE' ? 'Card unlocked' : 'Card updated',
      card: updatedCard,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const cardId = params.id;

    const card = await prisma.virtualCard.findFirst({
      where: { id: cardId, userId: user.id },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    await prisma.virtualCard.update({
      where: { id: card.id },
      data: { status: 'TERMINATED' },
    });

    return NextResponse.json({ success: true, message: 'Card terminated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
