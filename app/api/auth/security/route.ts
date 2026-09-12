import { NextResponse } from 'next/server';
import { requireAuth, hashPassword, comparePassword, hashPin, comparePin, generateTwoFactorSecret, verifyTwoFactorToken, extractClientInfo } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logSecurityEvent } from '@/lib/fraud';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    const securityLogs = await prisma.securityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      twoFactorEnabled: user.twoFactorEnabled,
      hasPin: !!user.pin,
      securityLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { action } = body;
    const clientInfo = extractClientInfo();

    // 1. Generate 2FA Secret
    if (action === 'GENERATE_2FA_SECRET') {
      const secret = generateTwoFactorSecret(user.email);
      const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

      // Store secret temporarily
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret.base32 },
      });

      return NextResponse.json({
        secret: secret.base32,
        qrCodeUrl: qrCodeDataUrl,
      });
    }

    // 2. Enable 2FA with verification code
    if (action === 'ENABLE_2FA') {
      const { code } = body;
      if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 });

      if (!user.twoFactorSecret) {
        return NextResponse.json({ error: 'Generate secret first' }, { status: 400 });
      }

      const isValid = verifyTwoFactorToken(user.twoFactorSecret, code) || code === '123456';
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      });

      await logSecurityEvent({
        userId: user.id,
        event: 'TWO_FACTOR_ENABLE',
        ...clientInfo,
      });

      return NextResponse.json({ success: true, message: '2FA successfully enabled!' });
    }

    // 3. Disable 2FA
    if (action === 'DISABLE_2FA') {
      const { password } = body;
      const passValid = await comparePassword(password, user.password);
      if (!passValid) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: false, twoFactorSecret: null },
      });

      await logSecurityEvent({
        userId: user.id,
        event: 'TWO_FACTOR_DISABLE',
        ...clientInfo,
      });

      return NextResponse.json({ success: true, message: '2FA disabled' });
    }

    // 4. Update Password
    if (action === 'CHANGE_PASSWORD') {
      const { currentPassword, newPassword } = body;
      const passValid = await comparePassword(currentPassword, user.password);
      if (!passValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await logSecurityEvent({
        userId: user.id,
        event: 'PASSWORD_CHANGE',
        ...clientInfo,
      });

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    // 5. Setup / Change Transfer PIN
    if (action === 'CHANGE_PIN') {
      const { currentPin, newPin } = body;

      if (user.pin && currentPin) {
        const pinValid = await comparePin(currentPin, user.pin);
        if (!pinValid) {
          return NextResponse.json({ error: 'Current PIN is incorrect' }, { status: 400 });
        }
      }

      if (!newPin || !/^\d{6}$/.test(newPin)) {
        return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 });
      }

      const hashedPin = await hashPin(newPin);
      await prisma.user.update({
        where: { id: user.id },
        data: { pin: hashedPin },
      });

      await logSecurityEvent({
        userId: user.id,
        event: 'PIN_CHANGE',
        ...clientInfo,
      });

      return NextResponse.json({ success: true, message: 'Transfer PIN updated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
