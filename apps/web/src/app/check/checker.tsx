"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import type { PreviewCheck, Verdict } from "@ogsnap/core/preview-audit";
import { PlatformPreview, type Platform } from "@/components/preview/platform-preview";
import { Button } from "@/components/ui/button";
import { UrlComposer } from "@/components/ui/url-composer";
import { cn } from "@/lib/utils";

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const VERDICTS: Record<Verdict, { title: string; body: (r: PreviewCheck) => string }> = {
  ok: { title: "Your link preview looks good", body: () => "Shared links show a custom image." },
  missing: { title: "No preview image", body: () => "Shared links show up as plain text with no picture, so fewer people click." },
  broken: {
    title: "Your preview image is broken",
    body: (r) => `The image or page failed to load (${r.imageStatus || "no response"}). Shared links show no picture.`,
  },
  generic: {
    title: "Your preview image is generic",
    body: () => "This page reuses your homepage image or the platform's default image, so every link looks the same.",
  },
  unknown: { title: "We couldn't read this page", body: () => "Your site blocked our crawler. Social networks may be blocked too." },
};

const SHOWN: Platform[] = ["X", "LinkedIn", "Slack"];

export function Checker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PreviewCheck | null>(null);

  async function run(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizeUrl(url) }),
      });
      if (!response.ok) throw new Error(await response.text());
      setResult(await response.json());
    } catch (requestError) {
      setError(requestError instanceof Error && requestError.message ? requestError.message : "Check failed");
    } finally {
      setLoading(false);
    }
  }

  const verdict = result ? VERDICTS[result.verdict] : null;
  const good = result?.verdict === "ok";
  const domain = result ? new URL(result.url).hostname.replace(/^www\./, "") : "";

  return (
    <div className="space-y-10">
      <UrlComposer id="check-url" label="Page address" value={url} onChange={setUrl} onSubmit={run} busy={loading} placeholder="yoursite.com/any-page">
        {loading ? "Checking..." : "Check preview"}
      </UrlComposer>

      <p role="status" aria-live="polite" className="sr-only">
        {loading ? "Checking your link preview" : verdict ? verdict.title : ""}
      </p>
      {error ? (
        <p role="alert" className="text-sm text-bad">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3" aria-hidden="true">
          {SHOWN.map((platform) => (
            <div key={platform} className="fog-shimmer aspect-[1.91/1] rounded-lg" />
          ))}
        </div>
      ) : null}

      {result && verdict ? (
        <>
          <div
            className={cn(
              "pop-in flex flex-col gap-4 rounded-xl border border-border border-l-4 bg-card p-5 sm:flex-row sm:items-center sm:justify-between",
              good ? "border-l-ok" : "border-l-bad",
            )}
          >
            <div className="space-y-1">
              <h2 className="wdth-80 font-display text-2xl font-extrabold">{verdict.title}</h2>
              <p className="text-sm text-foreground/75">{verdict.body(result)}</p>
              {result.width && result.height ? (
                <p className="font-mono text-xs text-muted-foreground">
                  {result.width} × {result.height}
                  {result.width < 1200 ? " · 1200 × 630 recommended" : ""}
                </p>
              ) : null}
            </div>
            <Button asChild variant={good ? "outline" : "flash"}>
              <Link href="/#preview">{good ? "Brand every page automatically" : "Fix it in 2 minutes"}</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {SHOWN.map((platform) => (
              <figure key={platform} className="space-y-2">
                <figcaption className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{platform}</figcaption>
                <PlatformPreview
                  platform={platform}
                  image={result.verdict === "broken" ? undefined : result.image}
                  domain={domain}
                  title={result.title}
                  siteName={result.siteName}
                  description={result.description}
                />
              </figure>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
