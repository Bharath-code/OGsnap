# OGSnap — Product Requirements Document (PRD)
**Version:** 1.0  
**Status:** Active  
**Last Updated:** February 2026

---

## 1. Product Vision

**OGSnap** is the social sharing intelligence layer built exclusively for JavaScript developers. While every competitor targets marketers and designers, OGSnap is designed to be installed in 3 lines of code across every major JS framework — Next.js, Astro, Remix, SvelteKit, TanStack Start — and generate beautiful, brand-consistent social images automatically.

One integration generates OG images, Twitter Cards, LinkedIn images, Slack previews, and Discord embeds — one API call, seven outputs.

**One sentence pitch:** Stop building your own OG image pipeline. Ship in 5 minutes, not 5 hours.

---

## 2. The Problem

Every JavaScript developer building a serious web product needs dynamic OG images — the preview cards that appear when links are shared on Twitter, LinkedIn, Slack, and WhatsApp. The current solutions are all broken in different ways:

- **Vercel OG** is free but Next.js-only, supports only a subset of CSS (no Grid), and requires JSX syntax. Every other framework is unsupported.
- **Bannerbear / Placid / Templated** are built for marketers. No SDKs, no framework integrations, complex template editors that assume no coding knowledge.
- **DIY Puppeteer** takes a weekend to build correctly, needs ongoing infrastructure maintenance, and breaks when dependencies update.

**Worse: no solution covers all platforms.** Developers need OG images for Twitter, LinkedIn, Slack, Discord, Facebook, WhatsApp. Managing 5 different services = chaos.

The result: millions of JavaScript developers either skip OG images entirely, spend hours on a fragile DIY solution, or pay for tools that don't fit how they work.

---

## 3. Target Users

**Primary — The Solo Developer / Indie Hacker**
- Building SaaS products, portfolios, blogs, or open source projects
- JavaScript-first, React/Node ecosystem
- Values their time above all else
- Has a company card or will expense under $50/month without approval
- Discovers tools through npm, GitHub, HN, Twitter
- **Pain point:** Doesn't want to maintain Puppeteer infrastructure but needs professional OG images

**Secondary — The Small Dev Team / Agency**
- Managing 3-10 web products or client sites
- Needs brand consistency across multiple projects
- Wants analytics to show clients their content is being shared
- Budget: $9-99/month is a business expense, not a personal decision
- **Pain point:** Managing multiple OG image solutions for different frameworks

**Tertiary — Content Creators / Technical Bloggers**
- Writing technical content, documentation, or newsletters
- Needs consistent, professional images at scale
- **Pain point:** Manually creating images for every post is time-consuming

**Not our customer (yet):**
- Enterprise companies (too slow to close, too expensive to support)
- Non-technical marketers (wrong acquisition channel, wrong product)

---

## 4. Core Features — MVP (v1.0)

### 4.1 Multi-Platform Image Generation API
- Single REST endpoint: `POST /api/render`
- Accepts: URL, title, description, author, tags, image, template override
- Returns: PNG image (default) or JPEG
- **One request generates images for:** OG (Twitter, Facebook, WhatsApp), Twitter Card (large), LinkedIn, Slack, Discord
- Powered by headless Chromium via Playwright
- Response time target: under 800ms for cache miss, under 50ms for cache hit
- Output size: 1200×630px (standard OG), custom sizes supported

### 4.2 Magic Onboarding (v1.0 - Key Differentiator)
- User pastes their website URL
- OGSnap uses Firecrawl to crawl and extracts: logo, primary/secondary colors, font family
- Auto-generates 5 sample OG images in 10 seconds
- No manual brand kit setup required
- **This is the "wow factor" that drives viral adoption**

### 4.3 Framework SDKs
Ship on day 1:
- `@ogsnap/next` — Next.js App Router + Pages Router
- `@ogsnap/astro` — Astro endpoint integration

Ship in week 3-4:
- `@ogsnap/svelte` — SvelteKit hooks
- `@ogsnap/remix` — Remix resource routes

**Moat strategy:** Expand to 10+ frameworks by Month 4 (Vue, Nuxt, Solid, Qwik, etc.)

Each SDK: 3-line install, zero config required, TypeScript-first, auto-reads page metadata.

### 4.3 Brand Kit
- Upload logo (PNG/SVG, up to 2MB)
- Set primary color, secondary color, background color
- Choose font (from 20 curated options + Google Fonts URL)
- Preview renders live before saving
- Brand kit applied automatically to all renders
- **AI Brand Extraction:** Auto-detect brand from URL (logo, colors, fonts)

### 4.4 Analytics Dashboard (v1.1)
- Renders by URL (most-generated images)
- Estimated share count (via referer header analysis)
- Platform breakdown (Twitter, LinkedIn, Slack, WhatsApp, other)
- Week-over-week trends
- **Viral content alerts:** Email when customer's content exceeds share thresholds
- Export as CSV

### 4.5 Auto-Regeneration (v1.1)
- Connect your blog/documentation/portfolio URL
- OGSnap monitors for content changes (polling or webhook)
- Auto-regenerates images when content changes
- No manual webhook setup needed
- **"Set it and forget it" — always fresh images**

### 4.6 Dashboard
- API key management (create, rotate, revoke)
- Usage meter (renders used / limit, resets monthly)
- Recent renders gallery (last 50 images with URL, timestamp, cache status)
- Brand kit editor
- Billing management (Stripe Customer Portal)
- Team seats management (Pro tier)

### 4.7 Caching Layer
- All renders cached by URL hash at CDN edge (Cloudflare)
- Cache TTL: 24 hours by default, configurable per-request (1h–30d)
- Cache invalidation via API: `POST /api/cache/purge`
- Cache hit rate target: >90% in steady state
- Pre-warming for popular content

### 4.8 Watermark (Free Tier)
- Small "ogsnap.dev" wordmark, bottom-right corner
- Semi-transparent, tasteful — not obnoxious
- Removed entirely on all paid plans
- Watermark serves as passive marketing on every shared link

---

## 5. Features — v1.1 (Month 2-3)

### 5.1 Templates
- 5 built-in layout templates (minimal, bold, gradient, dark, editorial)
- Template selected automatically based on content type (blog, product, docs, profile)
- Override per-request via `template` param

### 5.2 Webhooks
- `render.created` — fired on every new render
- `render.cached` — fired on cache hit
- `usage.threshold` — fired at 80% and 100% of plan limit

### 5.3 Team Seats
- Add multiple team members to workspace
- Role-based permissions (admin, editor, viewer)
- Organization-level analytics and billing

---

## 6. Features — v1.2+ (Month 4+)

### 6.1 Template Marketplace
- Community-submitted templates
- Free + Premium templates ($9-29 one-time)
- Template creators earn 50% revenue share
- Creates network effect moat

### 6.2 Framework Partnerships
- Official partnerships with Astro, Svelte, Remix, Vue, Nuxt
- Recommended in official framework documentation
- "OGSnap Certified" partner program

### 6.3 Enterprise Tier
- Unlimited renders ($499/mo)
- 99.99% uptime SLA
- Dedicated support
- Custom integrations
- White-label option (custom domain, no OGSnap branding)

### 6.4 Data Network Effects
- Aggregate anonymized performance data
- "What works" intelligence based on billions of renders
- AI-powered template optimization recommendations
- **Competitors can't replicate this data moat**

### 6.5 Referral Program
- Refer 1 friend → 500 free renders
- Refer 3 friends → 1 month Pro free
- Refer 10 friends → "OGSnap Champion" badge + early access
- "Built with OGSnap" badge for customer websites

---

## 7. Non-Goals (explicitly out of scope for MVP)

- Video/GIF generation
- Social media scheduling
- Non-OG image formats (banners, ads, email headers)
- Drag-and-drop template editor
- Multi-language support (English only at launch)
- Native mobile SDKs

---

## 8. Success Metrics

| Metric | Month 1 | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|----------|
| npm installs/week | 100 | 500 | 2,000 | 10,000 |
| Free signups | 50 | 300 | 1,000 | 5,000 |
| Paying customers | 5 | 40 | 150 | 500+ |
| MRR | $100 | $800 | $3,000 | $25,000 |
| Churn rate | <10% | <5% | <3% | <2% |
| API uptime | 99.5% | 99.9% | 99.9% | 99.99% |
| Cache hit rate | 80% | 90% | 95% | 97% |
| Discord members | 100 | 500 | 1,000 | 5,000 |
| Framework partnerships | 0 | 2 | 5 | 10+ |

---

## 9. Constraints

- Solo developer building this — no team, no funding
- 10-20 hours/week available
- Zero infrastructure budget at start (use free tiers aggressively)
- Must be profitable before month 4 (or anxiety will kill it)

---

## 10. Moat Strategy (Defensibility)

OGSnap's long-term defensibility comes from stacking multiple moats:

1. **Integration Moat:** Support 10+ frameworks → switching costs become massive
2. **Data Moat:** Aggregate performance data → AI optimization competitors can't replicate
3. **Community Moat:** Template marketplace + Discord → self-sustaining ecosystem
4. **Platform Moat:** Open core + standards → become the "AWS of social images"

The goal: Build infrastructure developers can't imagine working without — and would find incredibly painful to replace.
