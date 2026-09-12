import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { processDeposit } from '@/lib/ledger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-06-20' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    let event: Stripe.Event;

    if (webhookSecret && signature && !webhookSecret.includes('mock')) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // Mock event parser
      try {
        event = JSON.parse(body);
      } catch {
        return NextResponse.json({ received: true });
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0;
      const currency = (session.currency || 'USD').toUpperCase();

      if (userId && amountTotal > 0) {
        await processDeposit({
          userId,
          amount: amountTotal,
          currency,
          method: 'STRIPE',
          stripeSessionId: session.id,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
