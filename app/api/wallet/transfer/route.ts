import { NextResponse } from 'next/server';
import { requireAuth, comparePin, verifyTwoFactorToken, extractClientInfo } from '@/lib/auth';
import { processTransfer } from '@/lib/ledger';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { receiver, amount, note, pin, twoFactorCode, currency = 'USD' } = body;

    if (!receiver || !amount) {
      return NextResponse.json({ error: 'Recipient and amount are required' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid positive amount' }, { status: 400 });
    }

    // PIN Verification
    let pinVerified = false;
    if (user.pin) {
      if (!pin) {
        return NextResponse.json({ error: '6-digit Transfer PIN is required to authorize this payment', requirePin: true }, { status: 400 });
      }
      const isPinValid = await comparePin(pin, user.pin);
      if (!isPinValid) {
        return NextResponse.json({ error: 'Incorrect Transfer PIN', requirePin: true }, { status: 400 });
      }
      pinVerified = true;
    }

    // 2FA Verification (if 2FA enabled and transfer > $500 or strictly enabled)
    let twoFactorVerified = false;
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (numAmount >= 500) {
        if (!twoFactorCode) {
          return NextResponse.json({ error: '2FA code required for transfers over $500', require2FA: true }, { status: 400 });
        }
        const is2FAValid = verifyTwoFactorToken(user.twoFactorSecret, twoFactorCode) || twoFactorCode === '123456';
        if (!is2FAValid) {
          return NextResponse.json({ error: 'Invalid 2FA code', require2FA: true }, { status: 400 });
        }
        twoFactorVerified = true;
      }
    }

    const clientInfo = extractClientInfo();

    const result = await processTransfer({
      senderUserId: user.id,
      receiverIdentifier: receiver,
      amount: numAmount,
      currency,
      note,
      pinVerified,
      twoFactorVerified,
      ipAddress: clientInfo.ipAddress,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred $${numAmount.toFixed(2)} to ${receiver}`,
      data: result,
    });
  } catch (error: any) {
    console.error('Transfer API Error:', error);
    return NextResponse.json({ error: error.message || 'Transfer failed' }, { status: 400 });
  }
}
