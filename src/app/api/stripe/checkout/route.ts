import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";
import { hasProAccess } from "@/lib/subscription";

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

    if (!PLANS.PRO.priceId) {
      return NextResponse.json(
        { error: "STRIPE_PRO_PRICE_ID is not configured" },
        { status: 503 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (hasProAccess(subscription)) {
      return NextResponse.json(
        { error: "Already subscribed to Pro" },
        { status: 409 },
      );
    }

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId: customerId,
            status: "ACTIVE",
            plan: "FREE",
          },
        });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: PLANS.PRO.priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId: user.id, plan: "PRO" },
      },
      success_url: `${appUrl}/settings?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/settings?billing=canceled`,
      metadata: { userId: user.id, plan: "PRO" },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
