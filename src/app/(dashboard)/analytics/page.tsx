import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { hasProAccess } from "@/lib/subscription";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const user = await verifySession();

  if (!user) redirect("/login");
  if (user.role !== "ATHLETE") redirect("/portal");
  if (!hasProAccess(user.subscription)) redirect("/settings?upgrade=analytics");

  return <AnalyticsClient />;
}
