# OGSnap — Product Requirements Document (PRD)
**Version:** 1.0  
**Status:** Active  
**Last Updated:** February 2026

---

## 1. Product Vision

**OGSnap** is the OG image API built exclusively for JavaScript developers. While every competitor targets marketers and designers, OGSnap is designed to be installed in 3 lines of code across every major JS framework — Next.js, Astro, Remix, SvelteKit, TanStack Start — and generate beautiful, brand-consistent social images automatically.

**One sentence pitch:** Stop building your own OG image pipeline. Ship in 5 minutes, not 5 hours.

---

## 2. The Problem

Every JavaScript developer building a serious web product needs dynamic OG images — the preview cards that appear when links are shared on Twitter, LinkedIn, Slack, and WhatsApp. The current solutions are all broken in different ways:

- **Vercel OG** is free but Next.js-only, supports only a subset of CSS (no Grid), and requires JSX syntax. Every other framework is unsupported.
- **Bannerbear / Placid / Templated** are built for marketers. No SDKs, no framework integrations, complex template editors that assume no coding knowledge.
- **DIY Puppeteer** takes a weekend to build correctly, needs ongoing infrastructure maintenance, and breaks when dependencies update.

The result: millions of JavaScript developers either skip OG images entirely, spend hours on a fragile DIY solution, or pay for tools that don't fit how they work.

---

## 3. Target Users

**Primary — The Solo Developer / Indie Hacker**
- Building SaaS products, portfolios, blogs, or open source projects
- JavaScript-first, React/Node ecosystem
- Values their time above all else
- Has a company card or will expense under $50/month without approval
- Discovers tools through npm, GitHub, HN, Twitter

**Secondary — The Small Dev Team / Agency**
- Managing 3-10 web products or client sites
- Needs brand consistency across multiple projects
- Wants analytics to show clients their content is being shared
- Budget: $49-99/month is a business expense, not a personal decision

**Not our customer (yet):**
- Enterprise companies (too slow to close, too expensive to support)
- Non-technical marketers (wrong acquisition channel, wrong product)

---

## 4. Core Features — MVP (v1.0)

### 4.1 Image Generation API
- Single REST endpoint: `POST /api/render`
- Accepts: URL, title, description, author, tags, image, template override
- Returns: PNG image (default) or JPEG
- Powered by headless Chromium via Playwright
- Response time target: under 800ms for cache miss, under 50ms for cache hit
- Output size: 1200×630px (standard OG), 2:1 ratio

### 4.2 Framework SDKs
Ship on day 1:
- `@ogsnap/next` — Next.js App Router + Pages Router
- `@ogsnap/astro` — Astro endpoint integration

Ship in week 3-4:
- `@ogsnap/svelte` — SvelteKit hooks
- `@ogsnap/remix` — Remix resource routes
- `@ogsnap/tanstack` — TanStack Start server functions

Each SDK: 3-line install, zero config required, TypeScript-first, auto-reads page metadata.

### 4.3 Brand Kit
- Upload logo (PNG/SVG, up to 2MB)
- Set primary color, secondary color, background color
- Choose font (from 20 curated options + Google Fonts URL)
- Preview renders live before saving
- Brand kit applied automatically to all renders

### 4.4 Dashboard
- API key management (create, rotate, revoke)
- Usage meter (renders used / limit, resets monthly)
- Recent renders gallery (last 50 images with URL, timestamp, cache status)
- Brand kit editor
- Billing management (Stripe Customer Portal)

### 4.5 Caching Layer
- All renders cached by URL hash at CDN edge (Cloudflare)
- Cache TTL: 24 hours by default, configurable per-request (1h–30d)
- Cache invalidation via API: `POST /api/cache/purge`
- Cache hit rate target: >90% in steady state

### 4.6 Watermark (Free Tier)
- Small "ogsnap.dev" wordmark, bottom-right corner
- Semi-transparent, tasteful — not obnoxious
- Removed entirely on all paid plans
- Watermark serves as passive marketing on every shared link

---

## 5. Features — v1.1 (Month 2-3)

### 5.1 Analytics Dashboard
- Renders by URL (most-generated images)
- Estimated share count (via referer header analysis)
- Platform breakdown (Twitter, LinkedIn, Slack, WhatsApp, other)
- Week-over-week trends
- Export as CSV

### 5.2 Templates
- 5 built-in layout templates (minimal, bold, gradient, dark, editorial)
- Template selected automatically based on content type (blog, product, docs, profile)
- Override per-request via `template` param

### 5.3 Webhooks
- `render.created` — fired on every new render
- `render.cached` — fired on cache hit
- `usage.threshold` — fired at 80% and 100% of plan limit

---

## 6. Features — v1.2+ (Month 4+)

- White-label option (custom domain, no OGSnap branding)
- Team accounts (multiple members per workspace)
- White-label reseller program for agencies
- Vercel Integration (marketplace listing)
- Self-hosted Docker image (Enterprise only)

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

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| npm installs/week | 100 | 500 | 2,000 |
| Free signups | 50 | 300 | 1,000 |
| Paying customers | 5 | 40 | 150 |
| MRR | $100 | $800 | $3,000 |
| Churn rate | <10% | <5% | <3% |
| API uptime | 99.5% | 99.9% | 99.9% |
| Cache hit rate | 80% | 90% | 95% |

---

## 9. Constraints

- Solo developer building this — no team, no funding
- 10-20 hours/week available
- Zero infrastructure budget at start (use free tiers aggressively)
- Must be profitable before month 4 (or anxiety will kill it)
