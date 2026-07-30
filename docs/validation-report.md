# Validation Report — OGSnap (developer-first OG image API)

_Generated: 2026-07-06_

## Verdict
**Pivot required**

The engineering is real but the framing is fatal: OGSnap targets JavaScript developers — the one segment that already gets OG image generation for free via `@vercel/og`/Satori and a dozen open-source clones. The people who actually pay for image-generation APIs (marketers, no-code operators, agencies at volume) are explicitly listed as "not our customer." Keep the tech, change who it's for or what job it does.

## Scorecard
| Area | Score | Read |
|---|---:|---|
| Pain intensity | 2/5 | Setting up OG images is a one-time, ~2-hour annoyance for devs, not a recurring bleed. Free tools cap the pain. |
| Buyer clarity | 2/5 | "Solo dev with a company card" is a persona, not a named community with a budget line for this. |
| Urgency | 1/5 | Nobody's launch is blocked by OG images; "skip it entirely" is a viable (and common) choice. |
| Differentiation | 3/5 | Multi-framework SDKs + AI brand extraction is a real angle — but it differentiates against paid tools, not against free. |
| Speed to validate | 4/5 | MVP is largely built; a landing page + 20 DMs can test willingness to pay in two weeks. |
| Founder advantage | 3/5 | Solo JS dev building for JS devs — authentic channel access (npm, HN, X), but no unique distribution. |

## Core Assumption
JavaScript developers will pay $9–49/month for hosted OG image rendering instead of using free `@vercel/og`/Satori or copying a 50-line open-source recipe.

## Fatal Flaws
| Risk | Severity | Why It Matters | Fast Test |
|---|---|---|---|
| Free substitutes own the target segment | High | Satori/@vercel/og are free, official, and every framework has a copy-paste guide (Astro, SvelteKit, Remix included). The dev who can install an npm SDK can install Satori. | Post the landing page in 3 dev communities with a real price. Count card-entered signups, not stars. |
| Crowded paid market at every price point | High | Bannerbear $49, Placid $19, DynaPictures $29, Orshot at $0.01/image, imejis at $0.015/image, htmlcsstoimage, APITemplate — no pricing gap left to enter through. | Try to write one sentence a buyer would repeat that none of these can claim. If it's "SDKs for devs," see flaw #1. |
| Solo founder, 10–20 hrs/week vs. a distribution-heavy category | Medium | This category is won by SEO/integrations (Zapier, Shopify, Webflow), not code quality. PRD's own moats (10 frameworks, marketplace, data network) all assume scale that 10 hrs/week can't reach. | Ship one integration into a non-dev channel (e.g. Framer/Webflow plugin) and compare signups vs. npm route. |

## Problem Reality
- **Pain:** "I spent Saturday afternoon fighting Satori's CSS subset and my OG images still look generic." Real, but low frequency (per-project, once) and low cost (~2–4 hours, $0).
- **Early adopter:** Not the solo Next.js dev (they have @vercel/og). The realistic one: an agency dev shipping 5–10 client sites on mixed frameworks who wants brand-consistent previews without redoing the pipeline per site.
- **Vitamin or painkiller:** Vitamin for developers. It becomes a painkiller only for people who *cannot* run Satori: no-code site owners (Framer, Webflow, Shopify, Ghost) and marketers generating hundreds of variants.

## Competition
- **Current behavior:** Devs use @vercel/og/Satori, a free generator (og-image.org and friends), a static fallback image, or nothing at all. Marketers use Bannerbear/Placid/Canva.
- **Real enemy:** "Good enough for free" + inertia. Not any single company.
- **Differentiation needed:** Something free tools structurally can't do: AI brand extraction from a URL ("paste URL → 5 on-brand images in 10s"), cross-platform size pipeline, and share analytics. That bundle is the product; hosted Chromium rendering is not.

## First 10 Customers
1. **Agency owners in dev-agency communities** (Reddit r/webdev agency threads, Twitter/X agency circles, local dev Slack groups): DM 15 agencies running client sites; ask "how do you handle social previews across client sites today?" Success = 5 calls, 2 pilots.
2. **Framer/Webflow template creators and site builders** (Framer community forum, Webflow forum, Discord): offer manual concierge — "send me your site URL, I'll return a full branded OG set today." Success = 10 people accept, 3 offer to pay for automatic.
3. **Technical newsletter/blog authors on Ghost & Substack-adjacent platforms** (Ghost forum, Hacker News profiles with blogs): same concierge offer. Success = 3 paid pre-orders at $9/mo.

## MVP
- **Build:** Nothing new. Use the existing pipeline as a concierge: a single "paste your URL" page (already ~built as magic onboarding) + manual delivery of image sets. The test is who pays, not what renders.
- **Cut:** Svelte/Astro/Remix SDKs, template marketplace, analytics dashboard, webhooks, team seats, edge worker optimization. None of these test the core assumption.
- **2-week test:** Run the three customer actions above simultaneously. Success bar: ≥3 strangers pay real money. If devs won't pay but no-code owners will, that *is* the pivot.

## Edits Applied to product-idea.md
- Created `docs/product-idea.md` fresh from this validation run (none existed).
- Target user captured as the pivot direction: no-code/managed-platform site owners and multi-site agencies, not solo JS devs.
- Risky assumptions list = the three fatal flaws above.

## Next Step
Run the 2-week concierge test before writing more code or docs; if the pivot segment pays, re-run planning (Product Planner) around the "paste URL → branded social presence" framing.
