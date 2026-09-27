import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AGENCY_SITES, PLAN_PRICES } from "@/lib/pricing";
import { Aperture } from "@/components/brand/aperture";
import { LiveRenderDemo } from "@/components/onboarding/live-render-demo";
import { demoBrands } from "@/components/preview/brands";
import { BlankCard, OgCard } from "@/components/preview/og-card";
import { Button } from "@/components/ui/button";
import { Develop } from "@/components/ui/develop";
import { InView } from "@/components/ui/in-view";
import { cn } from "@/lib/utils";

const siteUrl = "https://ogsnap.dev";
const canonicalUrl = `${siteUrl}/`;
const description =
  "Paste your URL and OGSnap builds a branded link preview from your logo, colors and fonts. Install once on Lovable, Framer, Webflow or any site.";

export const metadata: Metadata = {
  title: "OGSnap | Stop sharing grey boxes",
  description,
  keywords: [
    "link preview image",
    "open graph image generator",
    "lovable og image",
    "framer social image",
    "webflow open graph image",
    "og:image",
    "social share preview",
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "OGSnap | Stop sharing grey boxes",
    description: "Branded link previews for your site on X, LinkedIn, Slack, WhatsApp and iMessage.",
    url: canonicalUrl,
    siteName: "OGSnap",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OGSnap | Stop sharing grey boxes",
    description: `Your site, looking good every time it's shared. $${PLAN_PRICES.site} a site.`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

const posts = [
  { app: "X", who: "Maya Chen", handle: "@mayabuilds", text: "Finally shipped the new site", thread: false },
  { app: "LinkedIn", who: "Sam Ortiz", handle: "Founder, Fernhouse", text: "We redesigned everything. Have a look.", thread: false },
  { app: "Slack", who: "#launches", handle: "", text: "new landing is up", thread: true },
  { app: "iMessage", who: "Priya", handle: "", text: "", thread: false },
  { app: "WhatsApp", who: "Studio group", handle: "", text: "client site is live!", thread: false },
  { app: "Discord", who: "#show-and-tell", handle: "", text: "made this with lovable in a weekend", thread: true },
];

const pricing = [
  {
    plan: "Preview check",
    price: "$0",
    note: "",
    features: ["Today vs. branded preview", "Brand pulled from your site", "No signup"],
    cta: "Check my site",
    tilt: "-rotate-2",
    style: { background: "hsl(var(--fog))", color: "hsl(var(--foreground))" },
    flash: false,
  },
  {
    plan: "Site",
    price: `$${PLAN_PRICES.site}`,
    note: "per site / month",
    features: ["Branded preview image", "Install with three lines", "Lovable, Framer, Webflow or any site", "No watermark"],
    cta: "Check my site",
    tilt: "rotate-1",
    style: { background: demoBrands[0].bg, color: demoBrands[0].fg },
    flash: true,
  },
  {
    plan: "Agency",
    price: `$${PLAN_PRICES.agency}`,
    note: `${AGENCY_SITES} sites / month`,
    features: [`${AGENCY_SITES} client sites`, "A separate brand for each", "Setup help for each client"],
    cta: "Start with one site",
    tilt: "-rotate-1",
    style: { background: demoBrands[0].accent, color: demoBrands[0].bg },
    flash: false,
  },
];

const faqItems = [
  {
    question: "Do I need to code?",
    answer: "No. You paste three lines into your site's head. On Lovable, you paste one prompt and Lovable makes the edit for you.",
  },
  {
    question: "Where do the colors come from?",
    answer: "From your live site. OGSnap reads your logo, main colors and fonts and builds the preview from them.",
  },
  {
    question: "Will it change how my site looks?",
    answer: "No. It only changes the image people see when your link is shared. Visitors to your site see nothing different.",
  },
  {
    question: "Why does LinkedIn still show my old image?",
    answer: "LinkedIn caches link previews. Paste your link into LinkedIn's Post Inspector and it fetches the new one.",
  },
  {
    question: "I run an agency. Can each client keep their own brand?",
    answer: `Yes. The Agency plan covers ${AGENCY_SITES} sites for $${PLAN_PRICES.agency} a month, and each site gets its own brand.`,
  },
  {
    question: "Can I cancel?",
    answer: "Yes, anytime.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OGSnap",
    applicationCategory: "WebApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description,
    offers: [
      { "@type": "Offer", price: String(PLAN_PRICES.site), priceCurrency: "USD", category: "Site" },
      { "@type": "Offer", price: String(PLAN_PRICES.agency), priceCurrency: "USD", category: "Agency" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OGSnap",
    url: siteUrl,
    logo: `${siteUrl}/logo.svg`,
  },
];

const h2 = "wdth-70 max-w-[18ch] text-balance font-display text-[clamp(2.4rem,5.2vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.025em]";
const edge = "font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground";

const tree = [
  { x: 290, y: 12, path: "/", brand: demoBrands[0], title: "Build habits that stick", delay: 0 },
  { x: 40, y: 176, path: "/pricing", brand: demoBrands[0], title: "Pricing · Free for 14 days", delay: 700 },
  { x: 290, y: 176, path: "/blog/streaks", brand: { ...demoBrands[0], bg: "#F7F3EA", fg: "#0A3A5C" }, title: "Why streaks fail at day 9", delay: 850 },
  { x: 540, y: 176, path: "/changelog", brand: { ...demoBrands[0], bg: "#FF7A59", fg: "#0A3A5C", accent: "#0A3A5C" }, title: "Changelog · v2.4", delay: 1000 },
];

export default function HomePage() {
  return (
    <div className="space-y-28 pb-6 sm:space-y-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="pt-4 sm:pt-10">
        <LiveRenderDemo>
          <h1 className="wdth-62 text-balance font-display text-[clamp(3.25rem,8vw,6.5rem)] font-black leading-[0.88] tracking-[-0.035em]">
            Stop sharing <span className="greybox">grey&nbsp;boxes.</span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-foreground/80">
            Paste your URL. OGSnap reads your logo, colors and fonts and gives your site a branded preview on X, LinkedIn,
            Slack, WhatsApp and iMessage. Install it once. ${PLAN_PRICES.site} a site.
          </p>
        </LiveRenderDemo>
      </section>

      <section className="space-y-10">
        <div className="space-y-4">
          <h2 className={h2}>This is how most sites look when shared.</h2>
          <p className="max-w-[60ch] text-foreground/75">
            No image, a stretched logo, or a screenshot of the cookie banner. OGSnap replaces all of them with one preview
            built from your brand.
          </p>
        </div>
        <InView className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => {
            const brand = demoBrands[index];
            return (
              <article
                key={post.app}
                className={cn(
                  "grid content-start gap-2.5 rounded-2xl border border-border bg-card p-3.5",
                  post.thread && "border-l-4 border-l-fog-deep",
                )}
              >
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-fog" />
                  <b className="font-semibold">{post.who}</b>
                  <span className="text-muted-foreground">{post.handle}</span>
                </div>
                {post.text ? <p className="text-sm text-foreground/80">{post.text}</p> : null}
                <Develop
                  className={post.app === "iMessage" || post.app === "WhatsApp" ? "rounded-2xl" : "rounded-lg"}
                  delay={200 + index * 380}
                  before={<BlankCard />}
                  after={<OgCard brand={brand} />}
                />
                <p className={edge}>
                  {post.app} · {brand.domain}
                </p>
              </article>
            );
          })}
        </InView>
      </section>

      <section className="space-y-10">
        <h2 className={h2}>Live in three frames.</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          <li className="grid grid-rows-[210px_auto] overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid place-items-center border-b border-border bg-background p-5" aria-hidden="true">
              <div className="flex w-full rounded-full border border-border bg-card px-4 py-3 font-mono text-[15px]">
                <span className="w-0 animate-[type-in_5s_steps(13)_infinite] overflow-hidden whitespace-nowrap border-r-2 border-foreground">
                  tidepool.app
                </span>
              </div>
            </div>
            <div className="grid gap-1.5 p-5">
              <p className={edge}>Frame 1 of 3</p>
              <h3 className="wdth-80 font-display text-2xl font-extrabold leading-tight">Paste your address</h3>
              <p className="text-sm text-foreground/75">No account needed for the free check.</p>
            </div>
          </li>
          <li className="grid grid-rows-[210px_auto] overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative overflow-hidden border-b border-border bg-background p-5" aria-hidden="true">
              <div className="grid h-full content-start gap-2 rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="h-[22px] w-[22px] rounded-md" style={{ background: demoBrands[0].bg }} />
                  <span className="h-[18px] w-16 rounded-full" style={{ background: demoBrands[0].accent }} />
                </div>
                <span className="h-3.5 w-[70%] rounded-sm" style={{ background: demoBrands[0].bg }} />
                <span className="h-2 w-1/2 rounded-sm bg-fog" />
                <span className="h-2 w-2/5 rounded-sm bg-fog" />
                <span className="font-mono text-[10px] text-muted-foreground">Aa · Satoshi</span>
              </div>
              <span className="absolute left-4 top-3.5 h-7 w-7 animate-[sample_6s_var(--ease-develop)_infinite] rounded-full border-2 border-foreground shadow-[0_0_0_3px_hsl(var(--card))]" />
              <span className="absolute bottom-3 right-3 flex gap-1.5">
                {[demoBrands[0].bg, demoBrands[0].accent, demoBrands[0].fg].map((color, index) => (
                  <i
                    key={color}
                    className="block h-[22px] w-[22px] animate-[land_6s_infinite_both] rounded-md border-2 border-card shadow-[0_0_0_1px_hsl(var(--border))]"
                    style={{ background: color, animationDelay: `${0.4 + index * 1.2}s` }}
                  />
                ))}
              </span>
            </div>
            <div className="grid gap-1.5 p-5">
              <p className={edge}>Frame 2 of 3</p>
              <h3 className="wdth-80 font-display text-2xl font-extrabold leading-tight">We read your brand</h3>
              <p className="text-sm text-foreground/75">Logo, colors and fonts, taken from your live site.</p>
            </div>
          </li>
          <li className="grid grid-rows-[210px_auto] overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid place-items-center border-b border-border bg-background p-5">
              <pre className="w-full overflow-x-auto rounded-lg bg-terminal p-3.5 font-mono text-[11px] leading-snug text-terminal-foreground">
                <span className="text-flash">{"<meta"}</span>
                {' property="og:image"\n  content="…/og.png" />\n'}
                <span className="text-flash">{"<meta"}</span>
                {' name="twitter:card"\n  content="summary_large_image" />\n'}
                <span className="text-flash">{"<meta"}</span>
                {' name="twitter:image"\n  content="…/og.png" />'}
              </pre>
            </div>
            <div className="grid gap-1.5 p-5">
              <p className={edge}>Frame 3 of 3</p>
              <h3 className="wdth-80 font-display text-2xl font-extrabold leading-tight">Paste three lines</h3>
              <p className="text-sm text-foreground/75">Into your site&apos;s head, or paste one prompt into Lovable.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="space-y-10">
        <div className="space-y-4">
          <h2 className={h2}>Every page gets its own print.</h2>
          <p className="max-w-[60ch] text-foreground/75">
            Your pricing page, blog posts and changelog each get a preview with their own title. The site-wide preview works
            on every platform. Per-page previews need your domain on Cloudflare.
          </p>
        </div>
        <InView className="overflow-x-auto rounded-2xl border border-border bg-card p-5">
          <svg
            viewBox="0 0 760 290"
            className="block h-auto w-full min-w-[640px]"
            role="img"
            aria-label="Sitemap: the home page branches to pricing, blog and changelog, each with its own preview card"
          >
            {["M380 92 C380 140, 130 130, 130 176", "M380 92 L380 176", "M380 92 C380 140, 630 130, 630 176"].map((d, index) => (
              <path
                key={d}
                d={d}
                className="sitemap-wire fill-none stroke-fog-deep"
                strokeWidth={1.5}
                style={{ "--delay": `${index * 150}ms` } as CSSProperties}
              />
            ))}
            {tree.map((node) => (
              <g key={node.path} className="sitemap-node" style={{ "--delay": `${node.delay}ms` } as CSSProperties}>
                <rect x={node.x} y={node.y} width={180} height={80} rx={8} fill={node.brand.bg} />
                <circle cx={node.x + 160} cy={node.y + 10} r={node.path === "/" ? 34 : 14} fill={node.brand.accent} />
                <text x={node.x + 14} y={node.y + 62} fontSize={13} fontWeight={700} fill={node.brand.fg} className="font-display">
                  {node.title}
                </text>
                <text x={node.x + 90} y={node.y + 100} fontSize={12} textAnchor="middle" className="fill-muted-foreground font-mono">
                  {node.path}
                </text>
              </g>
            ))}
          </svg>
        </InView>
      </section>

      <section id="pricing" className="scroll-mt-24 space-y-10">
        <h2 className={h2}>One price per site.</h2>
        <div className="grid gap-8 px-2 md:grid-cols-3">
          {pricing.map((tier) => (
            <div
              key={tier.plan}
              className={cn(
                "grid content-start gap-4 rounded-md border border-border bg-card p-3.5 pb-6 shadow-[0_24px_60px_-36px_rgba(18,20,19,0.45)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0",
                tier.tilt,
              )}
            >
              <div className="grid aspect-[1.3] content-center justify-items-center gap-1.5 rounded-sm" style={tier.style}>
                <span className="wdth-62 font-display text-6xl font-black tracking-[-0.03em]">{tier.price}</span>
                {tier.note ? <span className="font-mono text-[13px]">{tier.note}</span> : null}
              </div>
              <h3 className="wdth-80 font-display text-2xl font-extrabold">{tier.plan}</h3>
              <ul className="grid gap-1.5 text-sm text-foreground/80">
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <span className="font-mono text-muted-foreground">+ </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button asChild size="sm" variant={tier.flash ? "flash" : "outline"} className="w-fit">
                <Link href="#preview">{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="space-y-8">
        <h2 className={h2}>Questions founders ask.</h2>
        <div className="grid gap-x-8 md:grid-cols-2">
          {faqItems.map((faq, index) => (
            <details key={faq.question} open={index === 0} className="group border-t border-border py-4">
              <summary className="wdth-90 flex cursor-pointer list-none justify-between gap-3 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span className="font-mono text-muted-foreground group-open:hidden">+</span>
                <span className="hidden font-mono text-muted-foreground group-open:inline">–</span>
              </summary>
              <p className="mt-2.5 max-w-[60ch] text-[15px] text-foreground/75">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-10 border-t border-border pt-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className={h2}>Your next shared link could look like this.</h2>
          <Button asChild size="lg" variant="flash">
            <Link href="#preview">Check my site</Link>
          </Button>
        </div>
        <div
          aria-hidden="true"
          className="wdth-62 flex items-center gap-[0.06em] overflow-hidden font-display text-[clamp(5rem,22vw,18rem)] font-black uppercase leading-[0.8] tracking-[-0.045em]"
        >
          <Aperture className="h-[0.8em] w-[0.8em] shrink-0" />
          OGSnap
        </div>
      </section>
    </div>
  );
}
