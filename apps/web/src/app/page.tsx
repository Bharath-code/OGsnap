import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  Braces,
  ChartColumnIncreasing,
  Check,
  Clock3,
  Cloud,
  Code2,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { MagicOnboarding } from "@/components/onboarding/magic-onboarding";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";

const siteUrl = "https://ogsnap.dev";
const canonicalUrl = `${siteUrl}/`;

const keywords = [
  "open graph image api",
  "dynamic og image generator",
  "next.js og image",
  "astro og image",
  "sveltekit og image",
  "remix og image",
  "tanstack start og image",
  "developer tools saas",
  "brand aware og image pipeline",
];

export const metadata: Metadata = {
  title: "OGSnap | Open Graph Image API For Modern JavaScript Teams",
  description:
    "Generate production-ready Open Graph images in 3 lines. OGSnap handles brand extraction, rendering, caching, and delivery for Next.js, Astro, SvelteKit, Remix, and TanStack Start.",
  keywords,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "OGSnap | Open Graph Image API For Modern JavaScript Teams",
    description:
      "Ship high-quality OG images in minutes with a brand-aware pipeline built for Next.js, Astro, SvelteKit, Remix, and TanStack Start.",
    url: canonicalUrl,
    siteName: "OGSnap",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OGSnap | Open Graph Image API",
    description:
      "OG images in 3 lines. Every modern JavaScript framework. Brand-aware, cached, and production-ready.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const trustSignals = [
  {
    value: "3 lines",
    title: "Fast integration",
    description: "Install SDK, set your key, export the route handler.",
  },
  {
    value: "5+ frameworks",
    title: "Broad JS support",
    description: "Next.js, Astro, SvelteKit, Remix, and TanStack Start.",
  },
  {
    value: "One pipeline",
    title: "Operationally simple",
    description: "Brand onboarding, rendering, caching, and billing in one flow.",
  },
  {
    value: "Built for scale",
    title: "Production path",
    description: "R2-backed storage plus tracked render events and usage limits.",
  },
];

const featurePillars = [
  {
    icon: Sparkles,
    title: "Brand-Aware Output",
    description: "Extract colors, logos, and typography once and reuse them across every OG render.",
  },
  {
    icon: Code2,
    title: "Framework Native APIs",
    description: "Drop into route handlers with familiar ergonomics for modern JavaScript stacks.",
  },
  {
    icon: Clock3,
    title: "Render + Cache Strategy",
    description: "Generate once, cache smartly, and ship reliable social previews every time.",
  },
  {
    icon: ShieldCheck,
    title: "Usage And Billing Gates",
    description: "Manage API keys, usage limits, and monetization controls without custom glue code.",
  },
  {
    icon: Cloud,
    title: "Storage You Can Trust",
    description: "Persist generated images to object storage for stable URLs and repeatable sharing.",
  },
  {
    icon: ChartColumnIncreasing,
    title: "Operator Visibility",
    description: "Track renders, cache hits, and pipeline behavior with practical dashboard signals.",
  },
];

const implementationSteps = [
  {
    step: "01",
    title: "Connect Your Brand Source",
    description: "Point OGSnap at your site once so the system can infer visual defaults and tone.",
  },
  {
    step: "02",
    title: "Wire A Route In Minutes",
    description: "Use the SDK in your framework and expose an OG endpoint with a tiny code surface.",
  },
  {
    step: "03",
    title: "Ship And Monitor",
    description: "Publish, watch usage and renders, and tighten performance with cache-aware behavior.",
  },
];

const pricing = [
  {
    plan: "Starter",
    price: "$0",
    cadence: "/month",
    description: "Best for testing and side projects.",
    features: ["Watermarked renders", "Core integrations", "Usage dashboard", "Community support"],
    cta: "Start Free",
    href: "/signup",
    highlight: false,
  },
  {
    plan: "Hobby",
    price: "$7",
    cadence: "/month",
    description: "For solo builders shipping publicly.",
    features: ["No watermark", "Higher monthly render limits", "Faster support", "Brand defaults"],
    cta: "Get Hobby",
    href: "/signup",
    highlight: true,
  },
  {
    plan: "Growth",
    price: "Custom",
    cadence: "",
    description: "For teams with larger delivery volume.",
    features: ["Custom quotas", "Priority support", "Launch planning", "Roadmap collaboration"],
    cta: "Talk To Us",
    href: "/dashboard/billing",
    highlight: false,
  },
];

const faqItems = [
  {
    question: "What is OGSnap?",
    answer:
      "OGSnap is a developer-focused SaaS for generating Open Graph images from a brand-aware rendering pipeline. It combines onboarding, rendering, caching, and delivery so teams avoid maintaining custom screenshot infrastructure.",
  },
  {
    question: "How fast can a team integrate OGSnap?",
    answer:
      "Most teams can ship the first endpoint quickly because the SDK pattern is intentionally small: install the package, provide an API key, and export a handler in your framework route.",
  },
  {
    question: "Which frameworks are supported?",
    answer:
      "OGSnap supports modern JavaScript stacks including Next.js, Astro, SvelteKit, Remix, and TanStack Start, with similar integration flow across each framework.",
  },
  {
    question: "How does caching work?",
    answer:
      "The render pipeline is designed to detect reusable results, reducing repeated work and improving consistency. You can inspect render behavior and cache outcomes from the dashboard.",
  },
  {
    question: "Can I control branding defaults?",
    answer:
      "Yes. OGSnap stores brand defaults such as logo and color cues from onboarding so your generated images remain visually consistent without repeated manual setup.",
  },
  {
    question: "Is OGSnap suitable for production usage?",
    answer:
      "Yes. OGSnap includes persistent storage, API key controls, usage tracking, and billing pathways so teams can move from demo to production without re-architecting the pipeline.",
  },
];

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "OGSnap",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description:
    "Open Graph image API for modern JavaScript teams with brand extraction, rendering, caching, and delivery.",
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "USD", category: "Starter" },
    { "@type": "Offer", price: "7", priceCurrency: "USD", category: "Hobby" },
  ],
  featureList: [
    "Brand-aware OG image generation",
    "SDK integrations for modern JS frameworks",
    "Render caching and usage tracking",
    "Object storage persistence",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OGSnap",
  url: siteUrl,
  logo: `${siteUrl}/logo.svg`,
  sameAs: ["https://github.com"],
};

export default function HomePage() {
  return (
    <div className="space-y-20 pb-6 sm:space-y-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(145deg,#fdf7ea_0%,#f5ebd8_45%,#eef1df_100%)] p-6 shadow-[0_40px_120px_-80px_rgba(44,34,12,0.8)] sm:p-10">
        <div className="pointer-events-none absolute -left-16 top-8 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-6 h-56 w-56 rounded-full bg-[#e8b484]/40 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(#85745f_0.7px,transparent_0.7px)] [background-size:5px_5px]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <Reveal className="space-y-6">
            <Badge className="w-fit bg-card/80 text-foreground">OG images in 3 lines. Every modern JS framework.</Badge>
            <h1 className="max-w-3xl font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              The SaaS pipeline for Open Graph images that actually scales.
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              OGSnap is the direct answer for teams asking how to generate dynamic Open Graph images without owning render
              infrastructure. You plug in once, then ship brand-consistent social cards across your product surface.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <Link href="/signup">
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 border-foreground/15 bg-card/60 px-7 text-base">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            </div>
            <ul className="grid gap-2 text-sm text-foreground/85 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Brand extraction + defaults
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                API key and usage controls
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Cache-aware render delivery
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Dashboard-first operations
              </li>
            </ul>
          </Reveal>

          <Reveal delay={180}>
            <Card className="overflow-hidden border-foreground/10 bg-[#152338] text-white">
              <CardContent className="space-y-4 p-0">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Wand2 className="h-4 w-4 text-[#7dd3fc]" />
                    Live Render Preview
                  </div>
                  <Badge className="bg-white/10 text-white">Route-ready</Badge>
                </div>
                <div className="space-y-4 px-5 pb-5">
                  <div className="rounded-lg border border-white/15 bg-white/5 p-4 font-mono text-xs text-white/90">
                    <div>{`POST /api/demo-render`}</div>
                    <div className="mt-2 text-[#7dd3fc]">{`{ "url": "https://example.com/post" }`}</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-[linear-gradient(140deg,#132034_0%,#273a56_48%,#0e1a2d_100%)] p-5">
                    <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/55">Generated OG</div>
                    <div className="rounded-md border border-white/10 bg-white/95 p-4 text-[#13203a]">
                      <div className="mb-2 text-xs uppercase tracking-wide text-[#3c4f71]">OGSnap</div>
                      <div className="font-display text-2xl leading-tight">
                        Stop maintaining custom OG workers for every app.
                      </div>
                      <div className="mt-3 text-xs text-[#516289]">ogsnap.dev</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      <section aria-label="Trust signals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {trustSignals.map((signal, index) => (
          <Reveal key={signal.title} delay={index * 70}>
            <Card className="h-full border-border/80 bg-card/75">
              <CardHeader className="space-y-1">
                <p className="font-display text-3xl leading-none text-foreground">{signal.value}</p>
                <CardTitle className="text-lg">{signal.title}</CardTitle>
                <CardDescription>{signal.description}</CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </section>

      <section id="features" className="space-y-7">
        <Reveal>
          <div className="space-y-3">
            <Badge className="w-fit">Why teams switch to OGSnap</Badge>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">Production standards without internal OG toil.</h2>
            <p className="max-w-3xl text-muted-foreground">
              OGSnap replaces scattered scripts and brittle screenshot jobs with one maintained service layer purpose-built
              for developer teams.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featurePillars.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 75}>
              <Card className="h-full border-border/80 bg-card/70">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <feature.icon className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <Reveal className="space-y-4">
          <Badge className="w-fit">Implementation path</Badge>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">How to launch dynamic OG images in one sprint.</h2>
          <p className="text-muted-foreground">
            This workflow is built for the real-world question teams ask: what is the safest way to ship dynamic OG images
            while keeping DX clean and ops predictable?
          </p>
          <div className="space-y-3">
            {implementationSteps.map((item, index) => (
              <Card key={item.step} className="border-border/70 bg-card/70">
                <CardHeader className="space-y-1">
                  <CardDescription className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                    {item.step}
                  </CardDescription>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Reveal>
        <Reveal delay={160}>
          <MagicOnboarding />
        </Reveal>
      </section>

      <section className="space-y-6">
        <Reveal className="space-y-3">
          <Badge className="w-fit">Developer-ready SDK</Badge>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">Integrate with a route, not a rewrite.</h2>
        </Reveal>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <Card className="overflow-hidden border-border/80 bg-[#1a2130] text-[#dbe6ff]">
              <CardHeader className="border-b border-white/10 bg-[#20293a]">
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Braces className="h-5 w-5 text-[#9ad5ff]" />
                  3-line route handler
                </CardTitle>
                <CardDescription className="text-[#b7c7e8]">Answer-first integration for modern app routers.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed sm:text-sm">{`import { generateOG } from "@ogsnap/next";

export const { GET } = generateOG({
  apiKey: process.env.OGSNAP_API_KEY!,
});`}</pre>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={90}>
            <Card className="h-full border-border/80 bg-card/75">
              <CardHeader>
                <CardTitle className="text-2xl">Framework coverage</CardTitle>
                <CardDescription>Use the same mental model across your app stack.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 pt-0">
                {["Next.js", "Astro", "SvelteKit", "Remix", "TanStack Start"].map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/60 px-3 py-2 text-sm"
                  >
                    <Blocks className="h-4 w-4 text-primary" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      <section id="pricing" className="space-y-6">
        <Reveal className="space-y-3">
          <Badge className="w-fit">Simple pricing</Badge>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">Choose the plan that matches your shipping pace.</h2>
        </Reveal>
        <div className="grid gap-4 lg:grid-cols-3">
          {pricing.map((tier, index) => (
            <Reveal key={tier.plan} delay={index * 80}>
              <Card
                className={`h-full border-border/80 ${
                  tier.highlight
                    ? "bg-[linear-gradient(150deg,#fef1d8_0%,#f9e9cc_38%,#f3f0e1_100%)] shadow-[0_30px_90px_-60px_rgba(112,72,22,0.9)]"
                    : "bg-card/75"
                }`}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{tier.plan}</CardTitle>
                    {tier.highlight ? <Badge className="bg-primary text-primary-foreground">Most popular</Badge> : null}
                  </div>
                  <p className="font-display text-4xl text-foreground">
                    {tier.price}
                    <span className="ml-1 font-sans text-base text-muted-foreground">{tier.cadence}</span>
                  </p>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-foreground/85">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full" variant={tier.highlight ? "default" : "outline"}>
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="faq" className="space-y-5">
        <Reveal className="space-y-3">
          <Badge className="w-fit">FAQ for search + AI answers</Badge>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">Direct answers buyers and bots can both parse.</h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 60}>
              <Card className="h-full border-border/80 bg-card/75">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl">{faq.question}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{faq.answer}</CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-[linear-gradient(140deg,#11243f_0%,#1d3454_52%,#1a2a3f_100%)] p-8 text-white sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-[#7dd3fc]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-12 h-52 w-52 rounded-full bg-[#f8c37e]/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <Badge className="w-fit bg-white/15 text-white">Ready to ship</Badge>
              <h2 className="font-display text-4xl leading-tight sm:text-5xl">Launch your OG pipeline this week.</h2>
              <p className="text-sm text-white/80 sm:text-base">
                Replace brittle image scripts with a dedicated SaaS flow built for product teams that move fast.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 bg-white text-[#11243f] hover:bg-white/90">
                <Link href="/signup">
                  <Rocket className="h-4 w-4" />
                  Create Free Account
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/40 text-white hover:bg-white/10">
                <Link href="/dashboard">
                  <Layers className="h-4 w-4" />
                  Explore Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
