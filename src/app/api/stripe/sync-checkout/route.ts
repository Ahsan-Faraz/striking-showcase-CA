import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { verifySessionFromRequest } from "@/lib/dal";
import { syncSubscriptionFromStripeSubscription } from "@/lib/stripe-billing";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ATHLETE") {
      return NextResponse.json(
        { error: "Only athletes can manage subscriptions" },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    let customerId = user.subscription?.stripeCustomerId ?? null;
    let stripeSubscription: Stripe.Subscription | null = null;

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });

      const metadataUserId = session.metadata?.userId;
      if (metadataUserId && metadataUserId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      customerId =
        typeof session.customer === "string" ? session.customer : customerId;

      if (user.subscription?.stripeCustomerId && customerId) {
        if (user.subscription.stripeCustomerId !== customerId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }

      stripeSubscription = session.subscription as Stripe.Subscription | null;
    }

    if (!stripeSubscription && customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 10,
      });

      stripeSubscription =
        subscriptions.data.find((subscription) =>
          ["active", "trialing", "past_due", "unpaid"].includes(
            subscription.status,
          ),
        ) ??
        subscriptions.data.find(
          (subscription) => subscription.status !== "canceled",
        ) ??
        null;
    }

    if (!customerId || !stripeSubscription) {
      return NextResponse.json(
        { error: "Stripe subscription not found for this account" },
        { status: 409 },
      );
    }

    const subscription = await syncSubscriptionFromStripeSubscription({
      subscription: stripeSubscription,
      customerId,
      fallbackUserId: user.id,
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Checkout sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync checkout status" },
      { status: 500 },
    );
  }
}
