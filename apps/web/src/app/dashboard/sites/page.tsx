"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ConvexError } from "convex/values";
import { useAuth } from "@clerk/nextjs";
import { Check, Copy, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AGENCY_SITES, PLAN_PRICES } from "@/lib/pricing";
import { type DashboardSite, siteImageUrl, useCreateSite, useSites } from "@/lib/dashboard-live";

const snippetFor = (siteId: string) => {
  const url = siteImageUrl(siteId);
  return [
    `<meta property="og:image" content="${url}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${url}" />`,
  ].join("\n");
};

// ponytail: Lovable is a Vite SPA, and crawlers only read index.html, so the prompt pins the edit there
const lovablePromptFor = (snippet: string) =>
  [
    "Update this site's social share image. Edit index.html only; social crawlers don't run JavaScript, so don't use react-helmet or any React component for this.",
    "1. In <head>, delete every existing og:image, twitter:image and twitter:card meta tag, including the default lovable.dev opengraph image.",
    "2. Add exactly these tags inside <head>:",
    snippet,
    "3. Don't change anything else and don't add packages.",
  ].join("\n");

async function openCheckout(body: { siteId: string } | { plan: "agency" }) {
  const response = await fetch("/api/billing/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text());
  const { checkoutUrl } = (await response.json()) as { checkoutUrl: string };
  window.location.assign(checkoutUrl);
}

function SiteCard({ site }: { site: DashboardSite }) {
  const [copied, setCopied] = useState<"snippet" | "lovable" | null>(null);
  const [activating, setActivating] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const snippet = snippetFor(site.id);

  async function activate() {
    setActivating(true);
    setBillingError(null);
    try {
      await openCheckout({ siteId: site.id });
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Could not start checkout");
      setActivating(false);
    }
  }

  async function copy(kind: "snippet" | "lovable") {
    await navigator.clipboard.writeText(kind === "lovable" ? lovablePromptFor(snippet) : snippet);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
          <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
          {site.domain}
        </h2>
        <Badge variant={site.status === "active" ? "default" : "secondary"}>
          {site.coveredByPlan ? "active · agency" : site.status}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {site.imageUrl ? (
          <img
            src={site.imageUrl}
            alt={`Link preview image for ${site.domain}`}
            className="aspect-[1.91/1] w-full rounded-lg border border-border/70 object-cover"
          />
        ) : (
          <div className="flex aspect-[1.91/1] w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            {site.renderError ? `Render failed: ${site.renderError}` : "Building your preview..."}
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Paste into your site&apos;s &lt;head&gt;</p>
          <pre className="overflow-x-auto rounded-lg border border-border/70 bg-muted/40 p-3 text-xs leading-relaxed">
            <code>{snippet}</code>
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => copy("snippet")}>
              {copied === "snippet" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "snippet" ? "Copied" : "Copy snippet"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => copy("lovable")}>
              {copied === "lovable" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "lovable" ? "Copied" : "Copy Lovable prompt"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            On Lovable? Paste the prompt into Lovable chat, then click Publish. Check it at <Link href="/check" className="underline">/check</Link>.
          </p>
          {site.status !== "active" ? (
            <div className="space-y-1 pt-2">
              <Button type="button" size="sm" onClick={activate} disabled={activating}>
                {activating ? "Opening checkout..." : `Activate for $${PLAN_PRICES.site}/month`}
              </Button>
              <p className="text-xs text-muted-foreground">
                {site.status === "trial"
                  ? "Trial previews carry a small watermark until the site is active."
                  : "This site is canceled, so shares show a neutral image."}
              </p>
              {billingError ? (
                <p role="alert" className="text-xs text-red-600">
                  {billingError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardSitesPage(): React.ReactElement {
  const { isSignedIn } = useAuth();
  const sites = useSites(Boolean(isSignedIn));
  const createSite = useCreateSite();
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const agency = sites?.agency;

  async function upgrade() {
    setUpgrading(true);
    setError(null);
    try {
      await openCheckout({ plan: "agency" });
    } catch (upgradeError) {
      setError(upgradeError instanceof Error ? upgradeError.message : "Could not start checkout");
      setUpgrading(false);
    }
  }

  async function addSite(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createSite({ domain });
      setDomain("");
    } catch (createError) {
      setError(
        createError instanceof ConvexError
          ? String(createError.data)
          : createError instanceof Error
            ? createError.message
            : "Could not add site",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h1 className="font-display text-3xl tracking-tight">Sites</h1>
          <CardDescription>Add a site, then paste its snippet once. Every share uses your branded preview.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addSite} className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="site-domain" className="sr-only">
              Site domain
            </label>
            <Input
              id="site-domain"
              placeholder="yoursite.com"
              required
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
            <Button type="submit" disabled={saving || !domain.trim()}>
              {saving ? "Adding..." : "Add site"}
            </Button>
          </form>
          {error ? (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          ) : null}
          {agency ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Agency plan: {agency.used} of {AGENCY_SITES} sites in use.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Managing client sites? Get {AGENCY_SITES} sites for ${PLAN_PRICES.agency}/month.</span>
              <Button type="button" variant="outline" size="sm" onClick={upgrade} disabled={upgrading}>
                {upgrading ? "Opening checkout..." : "Get agency plan"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {sites === undefined ? <p className="text-sm text-muted-foreground">Loading sites...</p> : null}
      {sites?.sites.length === 0 ? <p className="text-sm text-muted-foreground">No sites yet.</p> : null}
      {sites?.sites.map((site) => <SiteCard key={site.id} site={site} />)}
    </div>
  );
}
