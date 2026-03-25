import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "Warning: STRIPE_SECRET_KEY is not set. Stripe features will not work.",
  );
}

if (!process.env.STRIPE_PRO_PRICE_ID) {
  console.warn(
    "Warning: STRIPE_PRO_PRICE_ID is not set. Stripe checkout will not work.",
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const PLANS = {
  PRO: {
    name: "Striking Showcase Pro",
    price: 1799, // $17.99 in cents
    interval: "month" as const,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "Full recruiting portfolio",
      "Unlimited media uploads",
      "Coach messaging",
      "Stats tracking & benchmarks",
      "AI bio generator",
      "Profile analytics",
      "Tournament management",
    ],
  },
} as const;
