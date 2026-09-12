import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search')?.trim() || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId: user.id,
    };

    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { reference: { contains: search } },
        { description: { contains: search } },
        { senderWalletNumber: { contains: search } },
        { receiverWalletNumber: { contains: search } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: whereClause,
      }),
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
