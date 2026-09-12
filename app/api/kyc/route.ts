import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireAuth();

    let kyc = await prisma.kYC.findUnique({
      where: { userId: user.id },
    });

    if (!kyc) {
      kyc = await prisma.kYC.create({
        data: {
          userId: user.id,
          level: 'LEVEL_1',
          status: user.kycLevel === 'LEVEL_1' ? 'APPROVED' : 'UNVERIFIED',
        },
      });
    }

    return NextResponse.json({
      kyc,
      currentLevel: user.kycLevel,
      tier: user.tier,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const {
      level = 'LEVEL_2',
      firstName,
      lastName,
      dob,
      address,
      city,
      country,
      postalCode,
      idType = 'PASSPORT',
      idNumber,
      idFrontUrl,
      selfieUrl,
      proofOfAddressUrl,
      instantDemoApprove = false,
    } = body;

    const existingKyc = await prisma.kYC.findUnique({
      where: { userId: user.id },
    });

    const isLevel1 = level === 'LEVEL_1';
    const autoApprove = isLevel1 || instantDemoApprove;

    const kycData = {
      level,
      status: autoApprove ? 'APPROVED' : 'PENDING',
      firstName: firstName || existingKyc?.firstName,
      lastName: lastName || existingKyc?.lastName,
      dob: dob || existingKyc?.dob,
      address: address || existingKyc?.address,
      city: city || existingKyc?.city,
      country: country || existingKyc?.country,
      postalCode: postalCode || existingKyc?.postalCode,
      idType: idType || existingKyc?.idType,
      idNumber: idNumber || existingKyc?.idNumber,
      idFrontUrl: idFrontUrl || existingKyc?.idFrontUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      selfieUrl: selfieUrl || existingKyc?.selfieUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80',
      proofOfAddressUrl: proofOfAddressUrl || existingKyc?.proofOfAddressUrl,
      submittedAt: new Date(),
      reviewedAt: autoApprove ? new Date() : null,
      reviewedBy: autoApprove ? 'AUTOMATED_VERIFICATION_AI' : null,
    };

    const updatedKyc = await prisma.kYC.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...kycData,
      },
      update: kycData,
    });

    if (autoApprove) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          kycLevel: level,
        },
      });

      // Update transfer limit based on KYC level
      const newLimit = level === 'LEVEL_3' ? 100000.0 : level === 'LEVEL_2' ? 10000.0 : 1000.0;
      await prisma.wallet.updateMany({
        where: { userId: user.id },
        data: { dailyTransferLimit: newLimit },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `KYC Tier ${level.replace('LEVEL_', '')} Verification Approved 🎉`,
          message: `Your account limits have been increased to $${newLimit.toLocaleString()} / day.`,
          type: 'KYC',
          link: '/dashboard/kyc',
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'KYC Verification Documents Submitted 📑',
          message: 'Our compliance team is reviewing your identity documents. Verification typically takes 1-2 hours.',
          type: 'KYC',
          link: '/dashboard/kyc',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: autoApprove
        ? `KYC ${level} verified instantly!`
        : 'KYC documents submitted for compliance review.',
      kyc: updatedKyc,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
