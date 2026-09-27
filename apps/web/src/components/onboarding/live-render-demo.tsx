"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Develop } from "@/components/ui/develop";
import { Input } from "@/components/ui/input";
import { demoBrands } from "@/components/preview/brands";
import { BlankCard, OgCard } from "@/components/preview/og-card";

type Phase = "idle" | "loading" | "done" | "error";
type LeadPhase = "idle" | "saving" | "saved" | "error";

const demo = demoBrands[0];

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const hostOf = (value: string) => {
  try {
    return new URL(normalizeUrl(value)).hostname.replace(/^www\./, "");
  } catch {
    return value.trim();
  }
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

function Bubble({ children }: { children: ReactNode }) {
  return (
    <p className="pop-in max-w-[82%] self-start rounded-[18px] rounded-bl-md bg-background px-3.5 py-2.5 text-[15px] leading-snug">
      {children}
    </p>
  );
}

export function LiveRenderDemo({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [developed, setDeveloped] = useState(false);
  const [replied, setReplied] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [host, setHost] = useState("");
  const [email, setEmail] = useState("");
  const [leadPhase, setLeadPhase] = useState<LeadPhase>("idle");
  const [leadError, setLeadError] = useState<string | null>(null);
  const isDemo = phase === "idle";

  // Idle: loop the sample conversation so the hero shows the product before anyone types.
  useEffect(() => {
    if (!isDemo) return;
    setDeveloped(false);
    setReplied(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDeveloped(true);
      setReplied(true);
      return;
    }
    const timers = [
      setTimeout(() => setDeveloped(true), 1400),
      setTimeout(() => setReplied(true), 3400),
      setTimeout(() => setCycle((c) => c + 1), 10000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isDemo, cycle]);

  useEffect(() => {
    if (isDemo || !developed) return;
    const timer = setTimeout(() => setReplied(true), 1800);
    return () => clearTimeout(timer);
  }, [isDemo, developed]);

  async function runPreview(event: FormEvent) {
    event.preventDefault();
    setPhase("loading");
    setHost(hostOf(url));
    setCycle((c) => c + 1);
    setError(null);
    setBefore(null);
    setAfter(null);
    setDeveloped(false);
    setReplied(false);
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

  const domain = isDemo ? demo.domain : host;
  const blankLabel = phase === "error" ? "Couldn't open this site" : phase === "loading" && !after ? status : "No og:image";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        {children}

        <form
          id="preview"
          onSubmit={runPreview}
          className="mt-8 flex max-w-lg scroll-mt-28 gap-1.5 rounded-full border border-border bg-card p-1.5 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-foreground"
        >
          <label htmlFor="site-url" className="sr-only">
            Your website address
          </label>
          <input
            id="site-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            placeholder="yoursite.com"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-4 font-mono text-base outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" variant="flash" disabled={phase === "loading" || !url.trim()}>
            {phase === "loading" ? "Developing..." : "Develop my link"}
          </Button>
        </form>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>Free check, no signup</span>
          <span>Lovable, Framer, Webflow or any site</span>
        </p>

        <p role="status" aria-live="polite" className="sr-only">
          {phase === "loading" ? status : phase === "done" ? "Your branded preview is ready." : ""}
        </p>
        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {phase === "done" && after ? (
          leadPhase === "saved" ? (
            <p role="status" className="mt-6 flex items-center gap-2 text-sm">
              <Check className="h-4 w-4" aria-hidden="true" />
              Thanks! Your install snippet will arrive by email within 24 hours.
            </p>
          ) : (
            <form onSubmit={saveLead} className="mt-6 max-w-lg space-y-2">
              <label htmlFor="lead-email" className="text-sm font-medium">
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
                <p role="alert" className="text-sm text-red-700">
                  {leadError}
                </p>
              ) : null}
            </form>
          )
        ) : null}
      </div>

      <div className="flex min-h-[420px] flex-col justify-end gap-2.5 rounded-[28px] border border-border bg-card p-4 shadow-[0_24px_60px_-36px_rgba(18,20,19,0.45)]">
        <p className="mb-auto border-b border-border pb-2.5 text-center text-xs font-semibold text-muted-foreground">
          Maya · Messages
        </p>
        <Bubble>is this your new site??</Bubble>
        <div key={cycle} className="pop-in w-[82%] self-end overflow-hidden rounded-[18px] rounded-br-md bg-background">
          <Develop
            developed={developed}
            before={before ? <img src={before} alt={`Today's preview for ${domain}`} className="aspect-[1.91/1] w-full object-cover" /> : <BlankCard label={blankLabel} />}
            after={
              isDemo ? (
                <OgCard brand={demo} />
              ) : after ? (
                <img
                  src={after}
                  alt={`Branded preview for ${domain}`}
                  onLoad={() => setDeveloped(true)}
                  className="aspect-[1.91/1] w-full object-cover"
                />
              ) : null
            }
          />
          <div className="grid gap-0.5 px-3.5 pb-3 pt-2.5">
            <b className="text-sm font-semibold">{isDemo ? demo.name : domain}</b>
            <span className="font-mono text-xs text-muted-foreground">{domain}</span>
          </div>
        </div>
        {replied ? (
          <Bubble>ok that looks legit. who designed it?</Bubble>
        ) : developed ? (
          <span className="flex gap-1 self-start rounded-[18px] rounded-bl-md bg-background px-3.5 py-3.5" aria-hidden="true">
            {[0, 150, 300].map((delay) => (
              <i key={delay} className="h-[7px] w-[7px] animate-[typing_1s_infinite] rounded-full bg-fog-deep" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </span>
        ) : null}
      </div>
    </div>
  );
}
