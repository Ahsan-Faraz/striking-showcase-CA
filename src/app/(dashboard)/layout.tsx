import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { verifySession, getProfileCompletion } from "@/lib/dal";
import { hasProAccess } from "@/lib/subscription";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await verifySession();

  // Unauthenticated → login (belt-and-suspenders; middleware also does this)
  if (!user) redirect("/login");

  // COACH on /dashboard → redirect to /portal
  if (user.role === "COACH") redirect("/portal");

  const role = user.role;
  const profile = user.athleteProfile;

  // ATHLETE without an athlete profile at all → needs onboarding first
  if (role === "ATHLETE" && !profile) redirect("/onboarding");

  // Fetch completion percentage for sidebar display
  const completion = profile ? await getProfileCompletion(user.id) : null;

  const athleteName = profile
    ? `${profile.firstName} ${profile.lastName.charAt(0)}.`
    : undefined;
  const classYear = profile?.classYear;
  const completionPercentage = completion?.percentage ?? 0;
  const proAccess = hasProAccess(user.subscription);
  const slug = profile?.slug;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative">
      {/* Subtle ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="orb w-[600px] h-[600px] bg-maroon/8 -top-48 -right-48" />
        <div
          className="orb w-[400px] h-[400px] bg-gold/5 bottom-0 left-1/4"
          style={{ animationDelay: "4s" }}
        />
      </div>
      <Sidebar
        role={role}
        athleteName={athleteName}
        classYear={classYear}
        completionPercentage={completionPercentage}
        hasProAccess={proAccess}
        slug={slug}
      />
      <main className="lg:pl-64 min-h-screen relative z-10">
        <div className="p-4 pt-20 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
