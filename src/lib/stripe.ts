import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY is not set. Stripe features will not work.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
  typescript: true,
});

export const PLANS = {
  MONTHLY: {
    name: 'Striking Showcase Monthly',
    price: 1799, // $17.99 in cents
    interval: 'month' as const,
    trialDays: 30,
    features: [
      'Full recruiting portfolio',
      'Unlimited media uploads',
      'Coach messaging',
      'Stats tracking & benchmarks',
      'AI bio generator',
      'Profile analytics',
      'Tournament management',
    ],
  },
} as const;
