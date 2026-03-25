import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

type AppSubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";

const RECENT_NOTIFICATION_WINDOW_MS = 24 * 60 * 60 * 1000;

const STATUS_MAP: Record<Stripe.Subscription.Status, AppSubscriptionStatus> = {
  trialing: "TRIALING",
  active: "ACTIVE",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "PAST_DUE",
  incomplete_expired: "CANCELED",
  unpaid: "PAST_DUE",
  paused: "CANCELED",
};

function unixToDate(value?: number | null) {
  return value ? new Date(value * 1000) : null;
}

async function findUserIdByCustomerId(customerId: string) {
  const existing = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
  });

  return existing?.userId ?? null;
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
) {
  return STATUS_MAP[status] || "ACTIVE";
}

export async function ensureBillingNotification(
  userId: string,
  title: string,
  description: string,
  actionUrl = "/settings",
) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type: "SYSTEM",
      title,
      description,
      createdAt: {
        gte: new Date(Date.now() - RECENT_NOTIFICATION_WINDOW_MS),
      },
    },
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  return prisma.notification.create({
    data: {
      userId,
      type: "SYSTEM",
      title,
      description,
      actionUrl,
    },
  });
}

export async function syncSubscriptionFromStripeSubscription(options: {
  subscription: Stripe.Subscription;
  customerId?: string | null;
  fallbackUserId?: string | null;
}) {
  const customerId =
    options.customerId ||
    (typeof options.subscription.customer === "string"
      ? options.subscription.customer
      : options.subscription.customer?.id) ||
    null;

  if (!customerId) {
    return null;
  }

  const userId =
    options.fallbackUserId ||
    options.subscription.metadata?.userId ||
    (await findUserIdByCustomerId(customerId));

  if (!userId) {
    return null;
  }

  const status = mapStripeSubscriptionStatus(options.subscription.status);
  const plan = status === "CANCELED" ? "FREE" : "PRO";

  return prisma.subscription.upsert({
    where: { userId },
    update: {
      plan,
      status,
      stripeCustomerId: customerId,
      stripeSubscriptionId:
        status === "CANCELED" ? null : options.subscription.id,
      currentPeriodEnd:
        status === "CANCELED"
          ? null
          : unixToDate(options.subscription.current_period_end),
      trialEndsAt: unixToDate(options.subscription.trial_end),
    },
    create: {
      userId,
      plan,
      status,
      stripeCustomerId: customerId,
      stripeSubscriptionId:
        status === "CANCELED" ? null : options.subscription.id,
      currentPeriodEnd:
        status === "CANCELED"
          ? null
          : unixToDate(options.subscription.current_period_end),
      trialEndsAt: unixToDate(options.subscription.trial_end),
    },
  });
}

export async function syncSubscriptionFromInvoice(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id || null;
  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id || null;

  if (!customerId) {
    return null;
  }

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return syncSubscriptionFromStripeSubscription({
      subscription,
      customerId,
    });
  }

  const userId = await findUserIdByCustomerId(customerId);
  if (!userId) {
    return null;
  }

  const status = invoice.paid ? "ACTIVE" : "PAST_DUE";

  return prisma.subscription.upsert({
    where: { userId },
    update: {
      plan: "PRO",
      status,
      stripeCustomerId: customerId,
    },
    create: {
      userId,
      plan: "PRO",
      status,
      stripeCustomerId: customerId,
    },
  });
}

export async function getSubscriptionFromCheckoutSession(
  session: Stripe.Checkout.Session,
) {
  if (session.mode !== "subscription") {
    return null;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;

  if (!subscriptionId) {
    return null;
  }

  return stripe.subscriptions.retrieve(subscriptionId);
}
