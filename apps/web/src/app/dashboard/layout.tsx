import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ConvexClerkProvider } from "@/components/providers/convex-clerk-provider";
import { Reveal } from "@/components/ui/reveal";
import { syncUserToConvex } from "@/lib/user-sync";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/keys", label: "API Keys" },
  { href: "/dashboard/brand", label: "Brand Kit" },
  { href: "/dashboard/renders", label: "Renders" },
  { href: "/dashboard/billing", label: "Billing" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authState = await auth();
  const { userId } = authState;
  if (!userId) {
    redirect("/login");
  }

  try {
    await syncUserToConvex(authState);
  } catch (error) {
    console.error("Failed to sync Clerk identity to Convex", error);
  }

  return (
    <ConvexClerkProvider>
      <div className="space-y-4">
        <Reveal>
          <DashboardNav items={navItems} />
        </Reveal>
        <Reveal delay={70}>{children}</Reveal>
      </div>
    </ConvexClerkProvider>
  );
}
