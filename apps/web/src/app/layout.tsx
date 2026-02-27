import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Play, Wand2 } from "lucide-react";
import { Cormorant_Garamond, Work_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import "./globals.css";

const fontSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "OGSnap",
  description: "Generate OG images in minutes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const appChrome = (
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <header className="bg-grain sticky top-4 z-20 mb-8 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-[0_20px_60px_-42px_rgba(49,39,21,0.7)] backdrop-blur sm:px-5">
        <div className="relative flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="rounded-md bg-primary/15 p-1.5 text-primary">
              <Wand2 className="h-4 w-4" />
            </span>
            <span className="font-display text-2xl leading-none tracking-tight">OGSnap</span>
          </Link>

          {!clerkEnabled ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/dashboard" className="font-medium text-foreground hover:text-primary">
                Dashboard
              </Link>
              <span>Clerk disabled</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm" className="h-9">
                    <Play className="h-3.5 w-3.5" />
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary">
                  Dashboard
                </Link>
                <UserButton />
              </SignedIn>
            </div>
          )}
        </div>
      </header>

      <main>{children}</main>
    </div>
  );

  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body>
        {clerkEnabled ? <ClerkProvider>{appChrome}</ClerkProvider> : appChrome}
      </body>
    </html>
  );
}
