"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Check, Copy, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type DashboardSite, siteImageUrl, useCreateSite, useSites } from "@/lib/dashboard-live";

const snippetFor = (siteId: string) => {
  const url = siteImageUrl(siteId);
  return [
    `<meta property="og:image" content="${url}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${url}" />`,
  ].join("\n");
};

function SiteCard({ site }: { site: DashboardSite }) {
  const [copied, setCopied] = useState(false);
  const snippet = snippetFor(site.id);

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
          <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
          {site.domain}
        </h2>
        <Badge variant={site.status === "active" ? "default" : "secondary"}>{site.status}</Badge>
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
          <Button type="button" variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy snippet"}
          </Button>
          {site.status === "trial" ? (
            <p className="text-xs text-muted-foreground">Trial previews carry a small watermark until the site is active.</p>
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

  async function addSite(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createSite({ domain });
      setDomain("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not add site");
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
        </CardContent>
      </Card>

      {sites === undefined ? <p className="text-sm text-muted-foreground">Loading sites...</p> : null}
      {sites?.length === 0 ? <p className="text-sm text-muted-foreground">No sites yet.</p> : null}
      {sites?.map((site) => <SiteCard key={site.id} site={site} />)}
    </div>
  );
}
