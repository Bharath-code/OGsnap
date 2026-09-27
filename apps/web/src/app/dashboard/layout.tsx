import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ConvexClerkProvider } from "@/components/providers/convex-clerk-provider";
import { syncUserToConvex } from "@/lib/user-sync";

// ponytail: API tools keep their URLs and sit behind Developer; move them only if the API product is cut
const navItems = [
  { href: "/dashboard/sites", label: "Sites" },
  {
    href: "/dashboard/developer",
    label: "Developer",
    also: ["/dashboard/keys", "/dashboard/brand", "/dashboard/renders", "/dashboard/playground", "/dashboard/billing"],
    quiet: true,
  },
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
      <div className="grid gap-6 lg:grid-cols-[168px_minmax(0,1fr)] lg:gap-10">
        <DashboardNav items={navItems} />
        <div className="min-w-0">{children}</div>
      </div>
    </ConvexClerkProvider>
  );
}
