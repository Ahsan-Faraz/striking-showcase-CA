import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { hasProAccess } from "@/lib/subscription";
import ThemeStudioClient from "./ThemeStudioClient";

export default async function ThemeStudioPage() {
  const user = await verifySession();

  if (!user) redirect("/login");
  if (user.role !== "ATHLETE") redirect("/portal");
  if (!hasProAccess(user.subscription)) redirect("/settings?upgrade=theme");

  return <ThemeStudioClient />;
}
