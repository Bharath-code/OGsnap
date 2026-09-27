"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BlankCard } from "@/components/preview/og-card";
import { SiteDetail, StatusPill, Thumb, errorText, openBillingPortal, openCheckout } from "@/components/dashboard/site-detail";
import { Button } from "@/components/ui/button";
import { UrlComposer } from "@/components/ui/url-composer";
import { AGENCY_SITES, PLAN_PRICES } from "@/lib/pricing";
import { useCreateSite, useSites } from "@/lib/dashboard-live";
import { cn } from "@/lib/utils";

export default function DashboardSitesPage(): React.ReactElement {
  const { isSignedIn } = useAuth();
  const data = useSites(Boolean(isSignedIn));
  const createSite = useCreateSite();
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sites = data?.sites ?? [];
  const agency = data?.agency;
  const selected = sites.find((site) => site.id === selectedId) ?? sites[0];
  const active = sites.filter((site) => site.status === "active").length;

  async function upgrade() {
    setUpgrading(true);
    setError(null);
    try {
      await openCheckout({ plan: "agency" });
    } catch (upgradeError) {
      setError(errorText(upgradeError, "Could not start checkout"));
      setUpgrading(false);
    }
  }

  async function manageBilling() {
    setOpeningPortal(true);
    setError(null);
    try {
      await openBillingPortal();
    } catch (portalError) {
      setError(errorText(portalError, "Could not open billing"));
      setOpeningPortal(false);
    }
  }

  async function addSite(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      setSelectedId(await createSite({ domain }));
      setDomain("");
    } catch (createError) {
      setError(errorText(createError, "Could not add site"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="wdth-70 font-display text-4xl font-extrabold tracking-[-0.02em]">Sites</h1>
          {sites.length ? (
            <p className="text-sm text-muted-foreground">
              <b className="text-foreground">{sites.length}</b> {sites.length === 1 ? "site" : "sites"} ·{" "}
              <b className="text-foreground">{active}</b> active
              {agency ? ` · Agency plan: ${agency.used} of ${AGENCY_SITES} in use` : ""}
              {data?.canManageBilling ? (
                <>
                  {" · "}
                  <button type="button" onClick={manageBilling} disabled={openingPortal} className="font-medium text-foreground underline underline-offset-2 disabled:opacity-50">
                    {openingPortal ? "Opening billing..." : "Manage billing"}
                  </button>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
        <UrlComposer
          id="site-domain"
          label="Site domain"
          value={domain}
          onChange={setDomain}
          onSubmit={addSite}
          busy={saving}
          className="w-full md:w-[26rem]"
        >
          {saving ? "Adding..." : "Add a site"}
        </UrlComposer>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-bad">
          {error}
        </p>
      ) : null}

      {data === undefined ? (
        <div className="space-y-2" aria-label="Loading sites">
          {[0, 1].map((row) => (
            <div key={row} className="fog-shimmer h-[76px] rounded-xl" />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="grid items-center gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <h2 className="wdth-80 font-display text-2xl font-extrabold">Add your first site.</h2>
            <p className="text-foreground/75">Type its address above. We&apos;ll read your logo, colors and fonts and build its preview.</p>
          </div>
          <div className="overflow-hidden rounded-lg">
            <BlankCard />
          </div>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {sites.map((site) => (
              <li key={site.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(site.id)}
                  aria-current={site.id === selected?.id ? "true" : undefined}
                  className={cn(
                    "grid w-full grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-background sm:grid-cols-[120px_minmax(0,1fr)_auto_auto]",
                    site.id === selected?.id && "bg-background",
                  )}
                >
                  <Thumb site={site} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{site.domain}</span>
                    <span className="block font-mono text-xs text-muted-foreground">
                      added {new Date(site.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </span>
                  <StatusPill site={site} />
                  <span aria-hidden="true" className="hidden font-mono text-muted-foreground sm:block">
                    →
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {selected ? <SiteDetail key={selected.id} site={selected} /> : null}
        </>
      )}

      {!agency ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5 text-sm text-muted-foreground">
          <span>
            Managing client sites? Get {AGENCY_SITES} sites for ${PLAN_PRICES.agency}/month, each with its own brand.
          </span>
          <Button type="button" variant="outline" size="sm" onClick={upgrade} disabled={upgrading}>
            {upgrading ? "Opening checkout..." : "Get agency plan"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
