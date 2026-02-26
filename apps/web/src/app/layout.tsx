import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "OGSnap",
  description: "Generate OG images in minutes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const appChrome = (
    <main>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          padding: "10px 14px",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: 12,
          background: "rgba(15, 23, 42, 0.55)",
        }}
      >
        <Link href="/" style={{ fontWeight: 700 }}>
          OGSnap
        </Link>

        {!clerkEnabled ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.8 }}>
            <Link href="/dashboard">Dashboard</Link>
            <span>Clerk disabled</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="button" type="button">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" style={{ opacity: 0.9 }}>
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        )}
      </header>
      {children}
    </main>
  );

  return (
    <html lang="en">
      <body>
        {clerkEnabled ? <ClerkProvider>{appChrome}</ClerkProvider> : appChrome}
      </body>
    </html>
  );
}
