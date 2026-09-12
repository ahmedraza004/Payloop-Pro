import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken, extractClientInfo } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/fraud';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username/email and password are required' }, { status: 400 });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const clientInfo = extractClientInfo();

    // Find by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: cleanIdentifier.replace('@', '') },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify status
    if (user.status === 'FROZEN') {
      return NextResponse.json(
        { error: 'Your account is currently frozen due to security review. Contact support.' },
        { status: 403 }
      );
    }
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account has been suspended for policy violation.' },
        { status: 403 }
      );
    }

    // Verify Password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      await logSecurityEvent({
        userId: user.id,
        event: 'FAILED_LOGIN',
        ...clientInfo,
        riskLevel: 'MEDIUM',
        status: 'BLOCKED',
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if 2FA is required
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Issue a short-lived temp token for 2FA validation
      const temp2faToken = signToken(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          username: user.username,
        },
        '5m'
      );

      return NextResponse.json({
        requires2FA: true,
        tempToken: temp2faToken,
      });
    }

    // Log success login
    await logSecurityEvent({
      userId: user.id,
      event: 'LOGIN',
      ...clientInfo,
      riskLevel: 'LOW',
      status: 'SUCCESS',
    });

    // Set Session Cookie
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
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
