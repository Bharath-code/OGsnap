import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
    <div className="grid" style={{ gap: 16 }}>
      <nav className="card" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} style={{ opacity: 0.9 }}>
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
