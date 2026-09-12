import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    const bankAccounts = await prisma.bankAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bankAccounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { bankName, accountHolderName, accountNumber, routingNumber, iban, swiftCode } = body;

    if (!bankName || !accountNumber) {
      return NextResponse.json({ error: 'Bank name and account number are required' }, { status: 400 });
    }

    const maskedNumber =
      accountNumber.length > 4
        ? `•••• •••• ${accountNumber.slice(-4)}`
        : accountNumber;

    const bank = await prisma.bankAccount.create({
      data: {
        userId: user.id,
        bankName,
        accountHolderName: accountHolderName || user.name,
        accountNumber: maskedNumber,
        routingNumber: routingNumber || null,
        iban: iban || null,
        swiftCode: swiftCode || null,
        isDefault: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bank account added successfully',
      bank,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Bank ID required' }, { status: 400 });

    await prisma.bankAccount.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: 'Bank account removed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
