import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, hashPin, signToken, extractClientInfo } from '@/lib/auth';
import { generateWalletNumber } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password, pin = '123456' } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().replace('@', '').trim();

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { username: cleanUsername }],
      },
    });

    if (existing) {
      if (existing.email === cleanEmail) {
        return NextResponse.json({ error: 'Email is already registered' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const hashedPin = await hashPin(pin);

    // Create user with initial wallet & KYC record
    const user = await prisma.user.create({
      data: {
        name,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        pin: hashedPin,
        role: 'USER',
        status: 'ACTIVE',
        tier: 'FREE',
        kycLevel: 'LEVEL_1',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      },
    });

    // Auto-create USD wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        walletNumber: generateWalletNumber(),
        balance: 100.0, // $100 Welcome Bonus!
        availableBalance: 100.0,
        currency: 'USD',
        dailyTransferLimit: 1000.0,
      },
    });

    // Welcome Transaction Bonus
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId: user.id,
        type: 'BONUS',
        amount: 100.0,
        currency: 'USD',
        status: 'COMPLETED',
        reference: `BNS-${Date.now().toString().slice(-6)}`,
        description: 'Welcome Sign-up Bonus Credit 🎁',
        riskScore: 'LOW',
      },
    });

    // Welcome Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to PayLoop Pro! 🚀',
        message: 'Your account is ready and $100.00 welcome bonus has been deposited to your wallet.',
        type: 'SYSTEM',
        link: '/dashboard',
      },
    });

    // Sign JWT & set cookie
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
    });

    cookies().set('payloop_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        tier: user.tier,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
