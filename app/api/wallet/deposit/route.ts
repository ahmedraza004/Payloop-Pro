import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { processDeposit } from '@/lib/ledger';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { amount, currency = 'USD', method = 'STRIPE', mode = 'instant' } = body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Please enter a valid deposit amount' }, { status: 400 });
    }

    // If live Stripe session requested and valid Stripe secret key exists
    if (mode === 'stripe_hosted' && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('mock')) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2024-06-20' as any,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: currency.toLowerCase(),
                product_data: {
                  name: `PayLoop Pro Deposit - ${user.name}`,
                  description: `Credit funds to wallet for ${user.email}`,
                },
                unit_amount: Math.round(numAmount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${appUrl}/dashboard/deposit?success=true&session_id={CHECKOUT_SESSION_ID}&amount=${numAmount}`,
          cancel_url: `${appUrl}/dashboard/deposit?canceled=true`,
          client_reference_id: user.id,
          customer_email: user.email,
        });

        return NextResponse.json({
          url: session.url,
          sessionId: session.id,
        });
      } catch (stripeErr: any) {
        console.warn('Stripe checkout fallback to instant:', stripeErr.message);
        // Fallback to instant execution
      }
    }

    // Process Instant Deposit
    const result = await processDeposit({
      userId: user.id,
      amount: numAmount,
      currency,
      method: method === 'MOCK_CARD' ? 'STRIPE_CARD' : method,
      stripeSessionId: `mock_cs_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      message: `Deposit of $${numAmount.toFixed(2)} completed successfully!`,
      data: result,
    });
  } catch (error: any) {
    console.error('Deposit Error:', error);
    return NextResponse.json({ error: error.message || 'Deposit failed' }, { status: 400 });
  }
}
