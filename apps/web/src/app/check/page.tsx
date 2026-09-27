import type { Metadata } from "next";
import { Checker } from "./checker";

export const metadata: Metadata = {
  title: "Link Preview Checker | OGSnap",
  description: "Paste any URL to see how it looks when shared on X, LinkedIn and Slack, and whether its preview image is missing, broken or generic.",
  alternates: { canonical: "https://ogsnap.dev/check" },
};

export default function CheckPage() {
  return (
    <div className="space-y-12 pb-10 pt-4 sm:pt-10">
      <header className="space-y-5">
        <h1 className="wdth-62 max-w-[14ch] text-balance font-display text-[clamp(3rem,7vw,5.5rem)] font-black leading-[0.88] tracking-[-0.035em]">
          Is your link a <span className="greybox">grey&nbsp;box?</span>
        </h1>
        <p className="max-w-[34rem] text-lg leading-relaxed text-foreground/80">
          Paste any page. We fetch it the way X, LinkedIn and Slack do and show you what people see. Free, no signup.
        </p>
      </header>
      <Checker />
    </div>
  );
}
