import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const cleanQuery = query.toLowerCase().replace('@', '');

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } },
          { status: 'ACTIVE' },
          {
            OR: [
              { username: { contains: cleanQuery } },
              { email: { contains: cleanQuery } },
              { name: { contains: cleanQuery } },
              { wallets: { some: { walletNumber: { contains: cleanQuery } } } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        wallets: {
          select: {
            walletNumber: true,
            currency: true,
          },
        },
      },
      take: 6,
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
