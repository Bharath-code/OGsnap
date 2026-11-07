"use client";

import { useEffect, useState } from "react";
import { ConvexError } from "convex/values";
import type { PreviewCheck } from "@ogsnap/core/preview-audit";
import { Aperture } from "@/components/brand/aperture";
import { type CheckLine, readCheck } from "@/components/dashboard/read-check";
import { BlankCard } from "@/components/preview/og-card";
import { PLATFORMS, PlatformPreview, type Platform } from "@/components/preview/platform-preview";
import { Button } from "@/components/ui/button";
import { Develop } from "@/components/ui/develop";
import { PLAN_PRICES } from "@/lib/pricing";
import { type DashboardSite, siteImageUrl } from "@/lib/dashboard-live";
import { cn } from "@/lib/utils";

const snippetFor = (siteId: string) => {
  const url = siteImageUrl(siteId);
  return [
    `<meta property="og:image" content="${url}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${url}" />`,
  ].join("\n");
};

// ponytail: the Lovable agent picks the stack branch and the route wiring, so results vary until the install check covers inner pages
const lovablePromptFor = (siteId: string) => {
  const url = siteImageUrl(siteId);
  return [
    "Give every page of this site its own social share image. Don't add packages and don't change anything else.",
    `Image URL: the home page uses ${url}. Every other page uses ${url}?path=<its path>, for example ${url}?path=/pricing. For dynamic routes use the real path (/blog/my-post, not /blog/$slug), with no query string or hash.`,
    "Every page must end up with exactly one og:image and one twitter:image, both set to its image URL, plus twitter:card set to summary_large_image. Remove any others, including the default lovable.dev image.",
    "If this project uses TanStack Start (src/routes with createFileRoute): set these tags with the home page URL in the root route's head, then override both image tags in the head of each page route, using params for dynamic paths.",
    "If this project uses React and Vite: put these tags with the home page URL in index.html as the fallback, then update both image tags on every route change, using the project's existing head manager or, if it has none, one small component inside the router.",
    "When you finish, tell me which of the two setups you used and list the routes you covered.",
  ].join("\n\n");
};

export async function openCheckout(body: { siteId: string } | { plan: "agency" }) {
  const response = await fetch("/api/billing/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text());
  const { checkoutUrl } = (await response.json()) as { checkoutUrl: string };
  window.location.assign(checkoutUrl);
}

export async function openBillingPortal() {
  const response = await fetch("/api/billing/portal", { method: "POST" });
  if (!response.ok) throw new Error(await response.text());
  const { portalUrl } = (await response.json()) as { portalUrl: string };
  window.location.assign(portalUrl);
}

export const errorText = (error: unknown, fallback: string) =>
  error instanceof ConvexError ? String(error.data) : error instanceof Error && error.message ? error.message : fallback;

export function StatusPill({ site }: { site: DashboardSite }) {
  const [label, tone] =
    site.status === "active"
      ? [site.coveredByPlan ? "Active · Agency" : "Active", "text-ok bg-ok/10"]
      : site.status === "trial"
        ? ["Trial", "text-warn bg-warn/10"]
        : ["Canceled", "text-bad bg-bad/10"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1.5 pl-2 pr-2.5 text-xs font-semibold", tone)}>
      <span className="h-[7px] w-[7px] rounded-full bg-current" />
      {label}
    </span>
  );
}

export function Thumb({ site }: { site: DashboardSite }) {
  return site.imageUrl ? (
    <img src={site.imageUrl} alt="" className="aspect-[1.91/1] w-full rounded-md object-cover" />
  ) : (
    <div className="overflow-hidden rounded-md">
      <BlankCard label={site.renderError ? "Failed" : "Building"} />
    </div>
  );
}

function InstallCheck({ site }: { site: DashboardSite }) {
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<CheckLine[]>([]);
  const [passed, setPassed] = useState(0);

  useEffect(() => setLines([]), [site.id]);

  async function run() {
    setRunning(true);
    setLines([{ text: `GET https://${site.domain}/ as a social crawler`, tone: "dim" }]);
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `https://${site.domain}/` }),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = readCheck((await response.json()) as PreviewCheck, site);
      setLines(result.lines);
      if (result.tone === "ok") setPassed((n) => n + 1);
    } catch (error) {
      setLines((current) => [...current, { text: errorText(error, "Check failed. Try again in a minute."), tone: "bad" }]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="wdth-90 font-display text-lg font-bold">Install check</h3>
        {passed ? <Aperture trigger={passed} className="h-6 w-6 text-foreground" /> : null}
      </div>
      <div aria-live="polite" className="min-h-[132px] overflow-x-auto rounded-lg bg-terminal p-3.5 font-mono text-xs leading-relaxed text-terminal-foreground">
        {lines.length ? (
          lines.map((line, index) => (
            <p
              key={`${index}-${line.text}`}
              className={cn(
                "pop-in whitespace-pre-wrap break-all",
                line.tone === "dim" && "opacity-55",
                line.tone === "ok" && "text-[#7EE2B0]",
                line.tone === "warn" && "text-flash",
                line.tone === "bad" && "text-[#FF9C88]",
              )}
            >
              {line.text}
            </p>
          ))
        ) : (
          <p className="opacity-55">After you paste the lines and publish, check that X and LinkedIn can see your preview.</p>
        )}
      </div>
      <Button type="button" variant="flash" onClick={run} disabled={running}>
        {running ? "Checking..." : "Check install"}
      </Button>
    </div>
  );
}

export function SiteDetail({ site }: { site: DashboardSite }) {
  const [platform, setPlatform] = useState<Platform>("X");
  const [install, setInstall] = useState<"lovable" | "html">("lovable");
  const [copied, setCopied] = useState(false);
  const [activating, setActivating] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [wasBuilding] = useState(!site.imageUrl);
  const justBuilt = wasBuilding && Boolean(site.imageUrl);
  const snippet = snippetFor(site.id);

  async function activate() {
    setActivating(true);
    setBillingError(null);
    try {
      await openCheckout({ siteId: site.id });
    } catch (error) {
      setBillingError(errorText(error, "Could not start checkout"));
      setActivating(false);
    }
  }

  async function copy() {
    const text = install === "lovable" ? lovablePromptFor(site.id) : snippet;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const preview = site.imageUrl ? (
    <PlatformPreview platform={platform} image={site.imageUrl} domain={site.domain} />
  ) : (
    <div className="overflow-hidden rounded-lg">
      {site.renderError ? <BlankCard label={`Render failed: ${site.renderError}`} /> : <div className="fog-shimmer aspect-[1.91/1]" />}
    </div>
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section className="grid content-start gap-4 rounded-xl border border-border bg-card p-5" aria-label={`Preview of ${site.domain}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="wdth-80 break-all font-display text-2xl font-extrabold">{site.domain}</h2>
          <div className="flex flex-wrap gap-0.5 rounded-full border border-border bg-background p-0.5" role="group" aria-label="Show preview on">
            {PLATFORMS.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={platform === name}
                onClick={() => setPlatform(name)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs",
                  platform === name ? "bg-card font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        {justBuilt ? <Develop developed before={<div className="fog-shimmer h-full" />} after={preview} /> : preview}
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {site.imageUrl ? `${platform} · 1200 × 630 · ${site.domain}` : site.renderError ? "Render failed" : "Reading your brand · usually under a minute"}
        </p>
        {site.status !== "active" ? (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm text-foreground/75">
              {site.status === "trial"
                ? "Trial previews carry a small watermark until the site is active."
                : "This site is canceled, so shares show a neutral image."}
            </p>
            <Button type="button" onClick={activate} disabled={activating}>
              {activating ? "Opening checkout..." : `Keep it live · $${PLAN_PRICES.site}/month`}
            </Button>
            {billingError ? (
              <p role="alert" className="text-sm text-bad">
                {billingError}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="grid content-start gap-5 rounded-xl border border-border bg-card p-5" aria-label="Install">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="wdth-90 font-display text-lg font-bold">Install</h3>
            <div className="flex gap-0.5 rounded-full border border-border bg-background p-0.5" role="group" aria-label="Your site is built with">
              {(["lovable", "html"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={install === kind}
                  onClick={() => setInstall(kind)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs",
                    install === kind ? "bg-card font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {kind === "lovable" ? "Lovable" : "Any site"}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground/75">
            {install === "lovable"
              ? "Paste this prompt into Lovable chat, then click Publish."
              : "Paste these lines into your site's <head>, then publish."}
          </p>
          <pre className="max-h-44 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-[11.5px] leading-relaxed">
            <code className="whitespace-pre-wrap break-all">{install === "lovable" ? lovablePromptFor(site.id) : snippet}</code>
          </pre>
          <Button type="button" variant="outline" size="sm" onClick={copy}>
            {copied ? "Copied" : install === "lovable" ? "Copy prompt" : "Copy lines"}
          </Button>
        </div>
        <div className="border-t border-border pt-5">
          <InstallCheck site={site} />
        </div>
      </section>
    </div>
  );
}
