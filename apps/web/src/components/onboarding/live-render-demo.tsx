"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Phase = "idle" | "loading" | "done" | "error";
type LeadPhase = "idle" | "saving" | "saved" | "error";

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

async function streamPreview(
  url: string,
  on: { status: (m: string) => void; before: (src: string | null) => void; after: (src: string) => void },
) {
  const response = await fetch("/api/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!response.ok || !response.body) throw new Error(await response.text());

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let cut: number;
    while ((cut = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 2);
      const event = raw.match(/^event: (.*)$/m)?.[1];
      const data = JSON.parse(raw.match(/^data: (.*)$/m)?.[1] ?? "{}");
      if (event === "status") on.status(data.message);
      if (event === "brand") on.before(data.brand?.currentOgImage ?? null);
      if (event === "preview" && data.imageUrl) on.after(data.imageUrl);
      if (event === "error" || event === "warning") throw new Error(data.message ?? "Preview failed");
    }
  }
}

function PreviewFrame({ label, src, highlight }: { label: string; src: string | null; highlight?: boolean }) {
  return (
    <figure className="space-y-2">
      <figcaption className={highlight ? "text-sm font-semibold text-primary" : "text-sm text-muted-foreground"}>
        {label}
      </figcaption>
      {src ? (
        <img
          src={src}
          alt={`${label} link preview image`}
          className="aspect-[1.91/1] w-full rounded-lg border border-border/70 object-cover"
        />
      ) : (
        <div className="flex aspect-[1.91/1] w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
          No preview image
        </div>
      )}
    </figure>
  );
}

export function LiveRenderDemo() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [leadPhase, setLeadPhase] = useState<LeadPhase>("idle");
  const [leadError, setLeadError] = useState<string | null>(null);

  async function runPreview(event: FormEvent) {
    event.preventDefault();
    setPhase("loading");
    setError(null);
    setBefore(null);
    setAfter(null);
    setStatus("Reading your site...");
    try {
      await streamPreview(normalizeUrl(url), { status: setStatus, before: setBefore, after: setAfter });
      setPhase("done");
    } catch (requestError) {
      setError(requestError instanceof Error && requestError.message ? requestError.message : "Preview failed");
      setPhase("error");
    }
  }

  async function saveLead(event: FormEvent) {
    event.preventDefault();
    setLeadPhase("saving");
    setLeadError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, url: normalizeUrl(url) }),
      });
      if (!response.ok) throw new Error(await response.text());
      setLeadPhase("saved");
    } catch (requestError) {
      setLeadError(requestError instanceof Error && requestError.message ? requestError.message : "Could not save");
      setLeadPhase("error");
    }
  }

  return (
    <Card id="preview" className="scroll-mt-24">
      <CardHeader>
        <Badge className="w-fit">Free check, no signup</Badge>
        <h2 className="flex items-center gap-2 font-display text-xl tracking-tight">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          See your site&apos;s link preview
        </h2>
        <CardDescription>Paste your address. We&apos;ll show today&apos;s preview next to a branded one.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={runPreview} className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="site-url" className="sr-only">
            Your website address
          </label>
          <Input
            id="site-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="yoursite.com"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <Button type="submit" disabled={phase === "loading" || !url.trim()}>
            {phase === "loading" ? "Building..." : "Show my preview"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {phase === "loading" ? status : ""}
        </p>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {after ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <PreviewFrame label="Today" src={before} />
            <PreviewFrame label="With OGSnap" src={after} highlight />
          </div>
        ) : null}

        {phase === "done" && after ? (
          leadPhase === "saved" ? (
            <p role="status" className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              Thanks! Your install snippet will arrive by email within 24 hours.
            </p>
          ) : (
            <form onSubmit={saveLead} className="space-y-2">
              <label htmlFor="lead-email" className="text-sm font-medium text-foreground">
                Want this live on your site? Get the install snippet.
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="lead-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@yoursite.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Button type="submit" disabled={leadPhase === "saving"}>
                  {leadPhase === "saving" ? "Sending..." : "Email me the snippet"}
                </Button>
              </div>
              {leadError ? (
                <p role="alert" className="text-sm text-red-600">
                  {leadError}
                </p>
              ) : null}
            </form>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
