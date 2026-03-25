import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import {
  ensureBillingNotification,
  getSubscriptionFromCheckoutSession,
  syncSubscriptionFromInvoice,
  syncSubscriptionFromStripeSubscription,
} from "@/lib/stripe-billing";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscription = await getSubscriptionFromCheckoutSession(session);

        if (subscription) {
          await syncSubscriptionFromStripeSubscription({
            subscription,
            fallbackUserId: session.metadata?.userId ?? null,
          });
        }
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id || null;

        const subscription = await getSubscriptionFromCheckoutSession(session);

        if (subscription) {
          const synced = await syncSubscriptionFromStripeSubscription({
            subscription,
            customerId,
            fallbackUserId: session.metadata?.userId ?? null,
          });

          if (synced) {
            await ensureBillingNotification(
              synced.userId,
              "Payment Incomplete",
              "Your Stripe checkout did not complete successfully. Please try again or update your payment method.",
            );
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const synced = await syncSubscriptionFromStripeSubscription({
          subscription,
        });

        if (synced && subscription.cancel_at_period_end) {
          await ensureBillingNotification(
            synced.userId,
            "Subscription Will End",
            "Your Pro subscription will remain active until the end of the current billing period.",
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const synced = await syncSubscriptionFromStripeSubscription({
          subscription,
        });

        if (synced) {
          await ensureBillingNotification(
            synced.userId,
            "Subscription Ended",
            "Your Pro subscription has ended and your account is now on the Free plan.",
          );
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        const synced = await syncSubscriptionFromStripeSubscription({
          subscription,
        });

        if (synced) {
          await ensureBillingNotification(
            synced.userId,
            "Trial Ending Soon",
            "Your Pro trial will end soon. Update your billing details if needed to avoid interruption.",
          );
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await syncSubscriptionFromInvoice(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const synced = await syncSubscriptionFromInvoice(invoice);

        if (synced) {
          await ensureBillingNotification(
            synced.userId,
            "Payment Failed",
            "Your payment failed. Please update your payment method.",
          );
        }
        break;
      }

      case "invoice.payment_action_required": {
        const invoice = event.data.object as Stripe.Invoice;
        const synced = await syncSubscriptionFromInvoice(invoice);

        if (synced) {
          await ensureBillingNotification(
            synced.userId,
            "Payment Requires Action",
            "Your bank requires additional confirmation before your payment can complete.",
          );
        }
        break;
      }

      case "invoice.marked_uncollectible": {
        const invoice = event.data.object as Stripe.Invoice;
        const synced = await syncSubscriptionFromInvoice(invoice);

        if (synced) {
          await ensureBillingNotification(
            synced.userId,
            "Subscription Payment Uncollectible",
            "Stripe marked your invoice as uncollectible. Please update your billing details to restore access.",
          );
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
