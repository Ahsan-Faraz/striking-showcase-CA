export type SubscriptionSnapshot = {
  plan: string;
  status: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: string | Date | null;
  trialEndsAt?: string | Date | null;
} | null;

export function hasProAccess(subscription: SubscriptionSnapshot) {
  return (
    subscription?.plan === "PRO" &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING")
  );
}

export function getPlanLabel(plan: string | null | undefined) {
  if (plan === "PRO") return "Pro";
  return "Free";
}

export function getStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "TRIALING":
      return "Trialing";
    case "ACTIVE":
      return "Active";
    case "PAST_DUE":
      return "Past Due";
    case "CANCELED":
      return "Canceled";
    default:
      return "Inactive";
  }
}
