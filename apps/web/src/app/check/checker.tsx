"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import type { PreviewCheck, Verdict } from "@ogsnap/core/preview-audit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

function Thumb({ src, className = "" }: { src?: string; className?: string }) {
  return src ? (
    <img src={src} alt="" className={`aspect-[1.91/1] w-full object-cover ${className}`} />
  ) : (
    <div className={`flex aspect-[1.91/1] w-full items-center justify-center bg-muted text-xs text-muted-foreground ${className}`}>
      No image
    </div>
  );
}

function Previews({ r }: { r: PreviewCheck }) {
  const domain = new URL(r.url).hostname.replace(/^www\./, "");
  const title = r.title ?? domain;
  const image = r.verdict === "broken" ? undefined : r.image;
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <figure className="space-y-2">
        <figcaption className="text-sm font-medium text-muted-foreground">X (Twitter)</figcaption>
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <Thumb src={image} />
          <span className="absolute bottom-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">{domain}</span>
        </div>
      </figure>
      <figure className="space-y-2">
        <figcaption className="text-sm font-medium text-muted-foreground">LinkedIn</figcaption>
        <div className="overflow-hidden rounded-lg border border-border">
          <Thumb src={image} />
          <div className="space-y-1 bg-muted/40 p-3">
            <p className="line-clamp-2 text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{domain}</p>
          </div>
        </div>
      </figure>
      <figure className="space-y-2">
        <figcaption className="text-sm font-medium text-muted-foreground">Slack</figcaption>
        <div className="space-y-1 border-l-4 border-border pl-3">
          <p className="text-sm font-bold text-foreground">{r.siteName ?? domain}</p>
          <p className="text-sm font-semibold text-sky-600">{title}</p>
          {r.description ? <p className="line-clamp-3 text-sm text-muted-foreground">{r.description}</p> : null}
          <Thumb src={image} className="mt-2 max-w-[360px] rounded-md" />
        </div>
      </figure>
    </div>
  );
}

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

  return (
    <div className="space-y-8">
      <form onSubmit={run} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="check-url" className="sr-only">
          Page address
        </label>
        <Input
          id="check-url"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="yoursite.com/any-page"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? "Checking..." : "Check preview"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <p role="status" aria-live="polite" className="sr-only">
        {loading ? "Checking your link preview" : verdict ? verdict.title : ""}
      </p>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {result && verdict ? (
        <>
          <Card>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                {good ? (
                  <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                )}
                <div>
                  <h2 className="font-semibold text-foreground">{verdict.title}</h2>
                  <p className="text-sm text-muted-foreground">{verdict.body(result)}</p>
                  {result.width && result.height ? (
                    <p className="text-xs text-muted-foreground">
                      Image size {result.width}×{result.height}
                      {result.width < 1200 ? " (1200×630 recommended)" : ""}
                    </p>
                  ) : null}
                </div>
              </div>
              <Button asChild variant={good ? "outline" : "default"}>
                <Link href="/#preview">
                  {good ? "Brand every page automatically" : "Fix it in 2 minutes"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Previews r={result} />
        </>
      ) : null}
    </div>
  );
}
