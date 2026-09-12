import { NextResponse } from 'next/server';
import { requireAuth, comparePin } from '@/lib/auth';
import { processWithdrawal } from '@/lib/ledger';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { amount, bankAccountId, pin, currency = 'USD' } = body;

    if (!amount || !bankAccountId) {
      return NextResponse.json({ error: 'Amount and destination bank account are required' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid withdrawal amount' }, { status: 400 });
    }

    // Verify PIN if set
    if (user.pin) {
      if (!pin) {
        return NextResponse.json({ error: 'Transfer PIN is required to authorize withdrawal', requirePin: true }, { status: 400 });
      }
      const isPinValid = await comparePin(pin, user.pin);
      if (!isPinValid) {
        return NextResponse.json({ error: 'Incorrect Transfer PIN', requirePin: true }, { status: 400 });
      }
    }

    // Check KYC limit
    if (user.kycLevel === 'LEVEL_0' || user.kycLevel === 'LEVEL_1') {
      if (numAmount > 1000) {
        return NextResponse.json(
          { error: 'Tier 1 account withdrawal limit is $1,000. Please complete Tier 2 Identity Verification for higher limits.' },
          { status: 403 }
        );
      }
    }

    const result = await processWithdrawal({
      userId: user.id,
      amount: numAmount,
      bankAccountId,
      currency,
    });

    return NextResponse.json({
      success: true,
      message: `Withdrawal of $${numAmount.toFixed(2)} submitted successfully!`,
      data: result,
    });
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: error.message || 'Withdrawal failed' }, { status: 400 });
  }
}
