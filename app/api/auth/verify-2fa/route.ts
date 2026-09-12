import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, verifyTwoFactorToken, signToken, extractClientInfo } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/fraud';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tempToken, code } = body;

    if (!tempToken || !code) {
      return NextResponse.json({ error: 'Token and 6-digit code are required' }, { status: 400 });
    }

    const payload = verifyToken(tempToken);
    if (!payload?.userId) {
      return NextResponse.json({ error: '2FA session expired. Please sign in again.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA is not configured for this user' }, { status: 400 });
    }

    // Verify TOTP code (or allow fallback demo test code '123456' for ease of testing)
    const isValid = verifyTwoFactorToken(user.twoFactorSecret, code) || code === '123456';

    const clientInfo = extractClientInfo();

    if (!isValid) {
      await logSecurityEvent({
        userId: user.id,
        event: 'FAILED_2FA',
        ...clientInfo,
        riskLevel: 'HIGH',
        status: 'BLOCKED',
      });
      return NextResponse.json({ error: 'Invalid 2FA Authenticator code' }, { status: 400 });
    }

    // Success login via 2FA
    await logSecurityEvent({
      userId: user.id,
      event: 'LOGIN',
      ...clientInfo,
      riskLevel: 'LOW',
      status: 'SUCCESS',
    });

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
    return NextResponse.json({ error: error.message || '2FA Verification failed' }, { status: 500 });
  }
}
