import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateCardNumber, generateCVV } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    const cards = await prisma.virtualCard.findMany({
      where: { userId: user.id },
      include: {
        cardPurchases: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ cards });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { cardHolder, cardType = 'VISA', cardSkin = 'NEON_CYAN', spendingLimit = 2000 } = body;

    const currentCardsCount = await prisma.virtualCard.count({
      where: { userId: user.id, status: { not: 'TERMINATED' } },
    });

    // Check tier card issuance limits
    const maxCards = user.tier === 'PRO' ? 10 : 3;
    if (currentCardsCount >= maxCards) {
      return NextResponse.json(
        { error: `You have reached your limit of ${maxCards} active virtual cards. Upgrade to Pro for up to 10 cards.` },
        { status: 403 }
      );
    }

    const rawCardNumber = generateCardNumber();
    const last4 = rawCardNumber.slice(-4);
    const cvv = generateCVV();
    const currentYear = new Date().getFullYear();
    const expiryYear = currentYear + 4;
    const expiryMonth = Math.floor(1 + Math.random() * 12);

    const card = await prisma.virtualCard.create({
      data: {
        userId: user.id,
        cardHolder: (cardHolder || user.name).toUpperCase(),
        cardNumber: rawCardNumber,
        last4,
        expiryMonth,
        expiryYear,
        cvv,
        cardType,
        cardSkin,
        status: 'ACTIVE',
        spendingLimit: parseFloat(spendingLimit) || 2000.0,
        currentSpent: 0.0,
        isContactless: true,
        isOnlineActive: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Virtual Card Issued 💳',
        message: `Your new virtual ${cardType} card ending in ${last4} is ready to use for online payments.`,
        type: 'SYSTEM',
        link: '/dashboard/cards',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Virtual card created successfully!',
      card,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
