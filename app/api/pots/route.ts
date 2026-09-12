import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    const pots = await prisma.sharedPot.findMany({
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        contributions: {
          include: {
            user: {
              select: { id: true, name: true, username: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const {
      title,
      description,
      targetAmount,
      potType = 'SAVINGS',
      currency = 'USD',
      lockUntil,
      escrowSellerIdentifier,
    } = body;

    if (!title || !targetAmount) {
      return NextResponse.json({ error: 'Pot title and target amount are required' }, { status: 400 });
    }

    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      return NextResponse.json({ error: 'Please enter a valid target amount' }, { status: 400 });
    }

    let escrowSellerId = null;
    let escrowBuyerId = null;

    if (potType === 'ESCROW') {
      escrowBuyerId = user.id;
      if (escrowSellerIdentifier) {
        const seller = await prisma.user.findFirst({
          where: {
            OR: [
              { email: escrowSellerIdentifier.toLowerCase().trim() },
              { username: escrowSellerIdentifier.toLowerCase().replace('@', '').trim() },
            ],
          },
        });
        if (seller) escrowSellerId = seller.id;
      }
    }

    const pot = await prisma.sharedPot.create({
      data: {
        creatorId: user.id,
        title,
        description,
        targetAmount: numTarget,
        currentAmount: 0.0,
        currency,
        potType,
        status: 'ACTIVE',
        lockUntil: lockUntil ? new Date(lockUntil) : null,
        escrowBuyerId,
        escrowSellerId,
        escrowStatus: potType === 'ESCROW' ? 'HOLDING' : null,
      },
      include: {
        creator: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        contributions: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Shared Pot "${title}" created successfully!`,
      pot,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
