import type { Metadata } from "next";
import { Checker } from "./checker";

export const metadata: Metadata = {
  title: "Link Preview Checker | OGSnap",
  description: "Paste any URL to see how it looks when shared on X, LinkedIn and Slack, and whether its preview image is missing, broken or generic.",
  alternates: { canonical: "https://ogsnap.dev/check" },
};

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-16">
      <header className="space-y-3">
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">Link preview checker</h1>
        <p className="max-w-2xl text-muted-foreground">
          See how any page looks when shared on X, LinkedIn and Slack. Free, no signup.
        </p>
      </header>
      <Checker />
    </div>
  );
}
