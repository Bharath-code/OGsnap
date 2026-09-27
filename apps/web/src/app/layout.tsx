import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { Aperture } from "@/components/brand/aperture";
import { Button } from "@/components/ui/button";
import "./globals.css";

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const fontDisplay = Archivo({ subsets: ["latin"], variable: "--font-display", axes: ["wdth"] });

export const metadata: Metadata = {
  title: "OGSnap",
  description: "Branded link previews for your site on X, LinkedIn, Slack, WhatsApp and iMessage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const appChrome = (
    <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-20 -mx-4 mb-10 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Aperture className="h-7 w-7 text-foreground" />
            <span className="wdth-80 font-display text-xl font-extrabold leading-none tracking-tight">OGSnap</span>
          </Link>

          {!clerkEnabled ? (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/dashboard" className="font-medium text-foreground hover:underline">
                Dashboard
              </Link>
              <span>Clerk disabled</span>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link href="/#pricing" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block">
                Pricing
              </Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm" variant="outline">
                    Sign in
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="text-sm font-medium text-foreground hover:underline">
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
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable}`}>
      <body>
        {clerkEnabled ? <ClerkProvider>{appChrome}</ClerkProvider> : appChrome}
      </body>
    </html>
  );
}
