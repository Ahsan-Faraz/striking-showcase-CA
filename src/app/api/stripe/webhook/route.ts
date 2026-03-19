import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const statusMap: Record<string, 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'> = {
          trialing: 'TRIALING',
          active: 'ACTIVE',
          past_due: 'PAST_DUE',
          canceled: 'CANCELED',
          incomplete: 'PAST_DUE',
          incomplete_expired: 'CANCELED',
          unpaid: 'PAST_DUE',
          paused: 'CANCELED',
        };

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscription.id,
            status: statusMap[subscription.status] || 'ACTIVE',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : undefined,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: 'CANCELED',
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Ensure subscription is active after successful payment
        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: 'ACTIVE' },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: 'PAST_DUE' },
        });

        // Notify user
        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          await prisma.notification.create({
            data: {
              userId: sub.userId,
              type: 'SYSTEM',
              title: 'Payment Failed',
              description: 'Your payment failed. Please update your payment method.',
              actionUrl: '/settings',
            },
          });
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
