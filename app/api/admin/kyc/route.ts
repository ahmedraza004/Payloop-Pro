import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const pendingKyc = await prisma.kYC.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true, avatar: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const recentProcessed = await prisma.kYC.findMany({
      where: { status: { in: ['APPROVED', 'REJECTED'] } },
      include: {
        user: {
          select: { id: true, name: true, username: true, email: true, avatar: true },
        },
      },
      orderBy: { reviewedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ pendingKyc, recentProcessed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { kycId, decision, rejectionReason } = body; // decision: 'APPROVE' | 'REJECT'

    if (!kycId || !decision) {
      return NextResponse.json({ error: 'KYC ID and decision are required' }, { status: 400 });
    }

    const kyc = await prisma.kYC.findUnique({
      where: { id: kycId },
      include: { user: true },
    });

    if (!kyc) return NextResponse.json({ error: 'KYC submission not found' }, { status: 404 });

    const isApproved = decision === 'APPROVE';

    await prisma.$transaction(async (tx) => {
      await tx.kYC.update({
        where: { id: kyc.id },
        data: {
          status: isApproved ? 'APPROVED' : 'REJECTED',
          rejectionReason: isApproved ? null : rejectionReason || 'Verification document illegible or incomplete.',
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      });

      if (isApproved) {
        await tx.user.update({
          where: { id: kyc.userId },
          data: { kycLevel: kyc.level },
        });

        const newLimit = kyc.level === 'LEVEL_3' ? 100000.0 : 10000.0;
        await tx.wallet.updateMany({
          where: { userId: kyc.userId },
          data: { dailyTransferLimit: newLimit },
        });

        await tx.notification.create({
          data: {
            userId: kyc.userId,
            title: `KYC Tier ${kyc.level.replace('LEVEL_', '')} Verified! ✅`,
            message: `Your identity verification was approved by compliance. Daily limit increased to $${newLimit.toLocaleString()}.`,
            type: 'KYC',
            link: '/dashboard/kyc',
          },
        });
      } else {
        await tx.notification.create({
          data: {
            userId: kyc.userId,
            title: 'KYC Verification Update ⚠️',
            message: `Your verification submission was rejected: ${rejectionReason || 'Please resubmit valid government-issued ID'}.`,
            type: 'KYC',
            link: '/dashboard/kyc',
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `KYC submission for @${kyc.user.username} was ${isApproved ? 'approved' : 'rejected'}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
