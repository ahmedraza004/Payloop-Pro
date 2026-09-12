import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import prisma from './prisma';
import speakeasy from 'speakeasy';

const JWT_SECRET = process.env.JWT_SECRET || 'payloop_ultra_secure_jwt_secret_key_2026_fintech_production';
const COOKIE_NAME = 'payloop_session';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function comparePin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export function signToken(payload: JWTPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getSessionUser(): Promise<any | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        wallets: true,
        kycRecord: true,
      },
    });

    if (!user || user.status === 'FROZEN' || user.status === 'SUSPENDED') {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(): Promise<any> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(): Promise<any> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}

export function generateTwoFactorSecret(userEmail: string) {
  return speakeasy.generateSecret({
    name: `PayLoop Pro (${userEmail})`,
    length: 20,
  });
}

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}

export function extractClientInfo() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || 'Unknown Device';
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Macintosh')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) { os = 'Android'; device = 'Mobile'; }
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) { os = 'iOS'; device = 'Mobile'; }

  return { ipAddress, userAgent, browser, os, device, location: 'San Francisco, US' };
}
