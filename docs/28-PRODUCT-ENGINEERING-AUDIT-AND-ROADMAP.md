# 28-PRODUCT-ENGINEERING-AUDIT-AND-ROADMAP.md

**Audit Date:** June 2026
**Reviewer:** Multi-persona review (PM, Staff/Principal Engineer, UI/UX, CEO, CFO, CMO, CTO)
**Status:** Reference document for engineering roadmap

---

## Executive Summary

**Architecture: 7/10. The bones are genuinely good.**
**Product/market fit risk: 8/10 — the market is much harder than the docs pretend.**
**UX/UI polish: 4/10 — looks decent in isolation, full of friction in flow.**
**Code quality: 7/10. AI features: 1/10. The "wow" moment is broken.**

The thing that should be the entire reason this company exists — Magic Onboarding — is wired to a regex-based logo/color scraper, not AI. That single choice will determine whether this is a $30M ARR company or a dead GitHub repo in 6 months.

---

## 1. Architecture & System Design

### What you got right (Staff/Principal view)

- **Clean separation of concerns.** `apps/web` (Next.js), `apps/renderer` (Fastify + Playwright), `convex` (DB + HTTP + actions), `packages/core|next|astro` (SDKs). This is the right shape. `turbo.json` + `pnpm-workspace` are configured correctly.
- **Convex is a smart choice.** Replaces DB + queue + cache + auth glue. The domain split (`render/`, `brand/`, `billing/`, `apiKeys/`, `users/`, `usage/`, `dashboard/`, `onboarding/`) is clean and self-documenting. `convex/http.ts:1` is a 50-line router that maps every URL to a focused handler — well done.
- **Render pipeline is correctly decoupled.** Convex action (`convex/render/actions.ts:8`) builds HTML and calls the renderer over HTTP, with auth token, plan, dimensions, watermark. The renderer is a true microservice. That matches what Vercel OG, Satori, Bannerbear all do internally.
- **Cache is in Convex, not Redis.** `convex/lib/cache.ts:19` builds a deterministic key from `(apiKeyId, url, title, description, template, width, height)` and `getCachedRender` does a `by_cache_key` index lookup (`convex/render/queries.ts:4`). Correct. **One bug below.**
- **API key handling is correct.** `convex/lib/security.ts:17` generates `og_live_` + 24 random bytes hex, stores SHA-256 hash, returns raw key only on creation. `safeEqualString` is constant-time. `verifyDodoSignature` uses `crypto.subtle` HMAC-SHA256. Solid crypto hygiene for a v1.
- **Webhook idempotency exists.** `convex/billing/mutations.ts:56` dedupes by `(provider, eventId)` before processing. Good.
- **R2 storage is correct.** `apps/renderer/src/storage.ts:75` falls back to a data URL in dev, throws in prod if not configured. `CacheControl: public, max-age=31536000, immutable` on objects — that's the right call.
- **Browser pool with `minSize: 2` and unbounded growth** (`apps/renderer/src/pool.ts:41`) is fine for MVP, will get you killed at scale — see Risks.

### What needs to be fixed now

**Cache key is a 32-bit djb2 hash, not SHA-256.**
`convex/lib/cache.ts:11`:
```ts
function stableHash(input: string): string {
  let hash = 5381;
  // ...
  return (hash >>> 0).toString(16).padStart(8, "0");
}
```
This is **8 hex chars = 32 bits**. Birthday collisions at ~65k cached renders. For a 25K/mo Scale customer you'll collide inside their first month. Either document this as "good enough for v1" and use SHA-256, or commit to 8 chars and add an LRU eviction policy. **I'd fix this before launch.**

**`getCachedRender` returns the *most recent* row matching the cache key, not a lookup by `userId`.**
`convex/render/queries.ts:4`:
```ts
return await ctx.db.query("renderLogs").withIndex("by_cache_key", ...).order("desc").first();
```
But `cacheKey` is built from `apiKeyId`, so two different users hitting the same URL get different cache keys — correct. However, **the cache also includes `description` and `title`**, so if user A renders `?title="Hello"` and user B renders `?title="Hello!"`, they're separate rows. Over time you get an unbounded fan-out of cache rows per `(apiKeyId, url)` — which is the entire `renderLogs` table. There's no TTL, no eviction, no separation between "cache" and "audit log". At 1M renders you'll have 1M rows just for caching, and your dashboard "Renders" table will become the cache table. **Split the table**.

**Usage increment race condition.**
`convex/render/http.ts:65`:
```ts
if (cached?.imageUrl) {
  await ctx.runMutation(api.usage.mutations.incrementMonthlyUsage, { userId: apiKey.userId, by: 1 });
  ...
```
The cache-hit branch counts as a render, the cache-miss branch also counts (via `recordRender` → `usageCounters.rendersUsed + 1`). That's actually correct, but the **page is wide open to over-quota abuse**: a user at 99/100 can fire 1000 cache-hit requests and end the day at 1099/100. You need to **check `remaining` for cache hits too**, or document cache hits as "free" and only count misses. Pick one and ship the contract.

**`convex/onboarding/http.ts:84` runs 5 render actions in a loop, serially.**
This is the magic moment. 5 sequential Playwright renders = 5–15 seconds. **No progress indicator, no streaming, no parallelization.** A user staring at a spinner for 15s is a churn event. Parallelize with `Promise.allSettled` (you already do it with `warnings: warnings.length > 0 ? warnings : undefined`), or stream a preview per image as it completes.

**`convex/brand/actions.ts:11` `extractLogoUrl` regexes for class names containing "logo".**
This will miss 80%+ of real-world sites (most have logo in inline SVG, web component, `<picture>`, dynamic-loaded). It also returns `${base}/logo.png` as a default if nothing matches — almost always a 404. The whole extraction is **the "wow" feature, and it is regex-based on HTML string**. No vision, no SVG inspection, no LLM call, no heuristic for "the largest image above the fold." This is the single biggest reason this product will not get a "holy sh*t" moment on Product Hunt.

**Auth is inconsistent across entry points.** `convex/dashboard/queries.ts:36` accepts a `clerkId` as an arg from the client, then trusts the client. Any user can pass any clerkId and see another user's keys/renders. This is **broken**. You need to either (a) accept a session token via `ctx.auth.getUserIdentity()` like `ConvexProviderWithClerk` does, or (b) keep the HTTP route shape but require the same `x-internal-secret` you use elsewhere and have the web app forward it. Right now `dashboard/queries` should not exist as a public Convex query — only as the `/v1/internal/dashboard` HTTP route.

**The dev bootstrap endpoint (`convex/dev/http.ts:25`) mints users with `clerkId: dev_${Date.now()}` and **no email**. If dev ever runs in prod by accident, you get orphaned users. The check `process.env.NODE_ENV === "production"` is there but the deployment mode in Convex is not `NODE_ENV`. Use Convex's `isProduction` helper or check `process.env.CONVEX_DEPLOYMENT` against a known prod name.

### Data flow — is everything connected?

| Step | Wired? | Notes |
|---|---|---|
| Sign up (Clerk) | Yes | `user-sync.ts` → `users/mutations.upsertFromIdentity` |
| Get API key | Yes | `apiKeys/mutations.create` returns raw key once |
| Render | Yes | `render/http.ts` → `actions/generateImage` → `renderer/render` |
| Cache hit/miss counted | Partial | Counts correctly but over-quota allowed |
| Brand extraction from URL | Partial | Regex-based, low quality |
| Magic Onboarding preview (5 images) | Partial | Serial, 5–15s, no progress |
| DodoPayments checkout | Yes | `apps/web/src/app/api/billing/create-checkout/route.ts` |
| Webhook → plan upgrade | Yes | HMAC-verified, idempotent |
| Customer portal | Partial | Manual `customerId` input — no link from a saved value |
| Dashboard usage meter | Yes | Real-time via Convex `useQuery` |
| `Renders` page caching | Partial | Cache and audit are the same table |

---

## 2. Code Quality

### Strengths
- **Strong typing throughout.** `v.union(v.literal("free"), ...)` for plan, `v.id("users")` for FKs. `RenderBody`, `OnboardingBody`, `DashboardBody` interfaces are tight.
- **Escaping is correct.** `convex/render/template.ts:11` `escapeHtml` covers all 5 critical chars. `interpolate logoUrl with escapeHtml`.
- **zod validation on renderer input** (`apps/renderer/src/handler.ts:6`) with size bounds (200–3000). Good.
- **No `any` in the hot path** except a few in `convex/dashboard/queries.ts:11` (`async (ctx: any, userId...)`). Those should be `MutationCtx`.
- **No comments in code.** Clean, professional.
- **Single source of truth for plan limits** (`convex/billing/mutations.ts:4` `PLAN_LIMITS`). Used by webhook handler. If you need to change pricing, this is the file.

### Weaknesses

**`convex/render/actions.ts:1` uses `"use node";`** — that's correct for Playwright. But you're calling the **Playwright microservice over HTTP**, not running it in Convex. So `"use node"` is wasted. The action runs in Convex V8; the `fetch` is fine in V8. Remove `"use node"` and you get faster cold start + lower cost.

**`convex/dashboard/http.ts` and `convex/dashboard/queries.ts` are duplicates.** Both do `getKeysPanelByClerkId` logic. The HTTP version re-implements the query. The Convex query version is the broken auth one. Delete the query, keep the HTTP route with proper auth.

**`apps/web/src/lib/dashboard-live.ts:57` uses string-cast `FunctionReference`:**
```ts
const keysDashboardQuery = "dashboard/queries:getKeysPanelByClerkId" as unknown as FunctionReference<"query">;
```
This is intentional to avoid the codegen stub — but **the Convex generated files are still stubs**:
```
// Temporary scaffold stubs.
// Convex codegen will replace this file when `convex dev` or `convex codegen` runs.
```
The repo has a `check-convex-generated.mjs` script that fails CI if these stubs are committed. **Did you run it?** If you ever deploy without real codegen, every Convex call is `undefined`. Run `pnpm convex:codegen` against your real deployment before launch and commit the real generated files.

**`apps/web/src/lib/user-sync.ts:64` calls Convex via `fetch` from a Next.js Server Component** rather than using the typed Convex client. The same `/v1/internal/sync-user` HTTP route can be called from the server-side `ConvexHttpClient` with no auth token (since Convex on the server doesn't need Clerk). You currently have:
- Convex client **for queries** (`useQuery`)
- Plain `fetch` **for user sync** (to `/v1/internal/sync-user`)
- Plain `fetch` **for magic onboarding** (to `/api/onboarding/magic`)
- Plain `fetch` **for billing** (to `/api/billing/...`)

Four ways to talk to your own backend. Pick one (the typed Convex client everywhere) and delete the others.

**`apps/web/src/components/onboarding/magic-onboarding.tsx`** (the landing page demo) is **misleading**. The endpoint is `/api/demo-render`, which calls `/v1/render` with a hardcoded demo API key (`OGSNAP_DEMO_KEY`). That demo key lives in a user's environment — there's no concept of "anonymous demo render" that does not count against a real user. Either (a) remove the demo and replace with a static hero image, or (b) make a real public demo path that doesn't burn a free key. **Marketing truth matters for a launch.**

**`apps/renderer/src/handler.ts:18` calls `page.setContent` with `waitUntil: "networkidle"`** — fine for HTML+inline images, but **fails on slow CDNs** and adds 500ms+ to every render. For an OG image, "domcontentloaded" + a 250ms `waitForTimeout` is what you want. Also: `page.waitForTimeout(250)` is a code smell. Wait for a specific element (e.g., `.og-content`) to be visible.

**`apps/renderer/src/storage.ts:80` throws in prod if R2 is unconfigured.** Good. But in dev it returns a `data:image/png;base64,…` URL. That data URL is then stored in `imageUrl` and **your smoke test rejects data URLs in prod** (`scripts/smoke-deploy.mjs:62`). So local renders look fine, deploy smoke blows up. **Add a smoke test that explicitly exercises the dev fallback in local mode.**

**`apps/web/src/components/brand/brand-onboarding.tsx:113` `onError` hides the image** if the extracted logo URL is broken. The fallback should show a "Logo could not be fetched — upload your own" CTA. Otherwise the user is left with an empty box and no idea why.

---

## 3. UI / UX — Reduce Friction & Find the Wow

### What's good
- **Marketing page is genuinely well-designed.** Type pairing (Cormorant Garamond + Work Sans), the warm gradient with grain, the live-render preview card, the trust signals row, the SDK code block, the FAQ with schema.org JSON-LD — this is above the bar for dev tools. The Reveal-on-scroll component is well-implemented.
- **Pricing/plan copy is honest** ("Hobby", "Growth") and the FAQ schema is correct for AI citation.
- **`robots.ts` allows GPTBot, ClaudeBot, PerplexityBot, anthropic-ai explicitly.** Smart for AEO/SEO.
- **Dashboard nav** has a nice active-state animation. Tasteful.
- **`Reveal` component** is small, accessible (uses IntersectionObserver + `motion-reduce:transition-none`).

### What's bad — friction list

1. **No one knows what to do on first visit.** The home page is long, but the only CTA is "Start Free" → `/signup` → Clerk modal. The Magic Onboarding is **buried in the second fold** with a "Try It Live" card. If the wow is the differentiator, **make it the first thing above the fold**. Today, a developer lands → sees "OG images in 3 lines" → "Generate Demo Image" → fills URL → gets back a generic blue Playwright screenshot. That is **not** the "WTF this is magic" moment. The 5-image brand-matched preview is hidden two scrolls down.

2. **`/dashboard/brand` is not the Magic Onboarding flow.** It's the same `BrandOnboarding` component as the home page demo, embedded as-is. After login, a user lands on `/dashboard` and has no idea what to do next. There should be a guided first-run: "Welcome — let's set up your brand in 30 seconds. Paste your site URL." Right now, the dashboard is a wall of cards with no priority.

3. **The `MagicOnboarding` (home page demo) component (`components/onboarding/magic-onboarding.tsx`) does NOT call the magic endpoint.** It calls `/api/demo-render` which calls the regular `/v1/render`. It does **no brand extraction**. It just renders with the demo user's brand kit (which is probably empty → falls back to blue/orange). **The component named "Magic Onboarding" is not the magic onboarding.** It is a basic render demo. The real magic lives only in the dashboard's `BrandOnboarding` component and is gated behind sign-in. **This is the single biggest UX bug in the entire app.**

4. **Empty states are not delightful.** Renders table: "No renders found yet. Trigger `POST /v1/render` to populate this table." That tells a developer nothing about *how* to do that. The empty state should be: "Paste a URL or import your blog" with a button that opens the magic onboarding.

5. **The magic onboarding takes 5–15 seconds with no progress.** No per-image skeleton, no streaming, no "Generating preview 1 of 5…" indicator. Users will assume it's broken and refresh.

6. **API key copy on `/dashboard/keys`** copies only the *prefix* (e.g., `og_live_a1b2…`). That's a bug. The raw key is shown once on creation in a separate "Copy this key now" block — but if the user dismisses that modal, **the raw key is gone forever** (you correctly never store it). This is industry-standard but you need a "Generate new key" flow that's one click. Currently it's there but not surfaced.

7. **No live preview of "what your OG image will look like"** in the SDK install docs. A user copies `@ogsnap/next`, pastes it, deploys, and has no idea if the result will match their brand. The home page shows a static mockup. **Show a real `/dashboard/try` page that renders a real image from the current brand kit.**

8. **The marketing page claims "5+ frameworks"** but only `next` and `astro` are shipped. SvelteKit, Remix, TanStack Start are advertised as supported, in keywords, and in the schema.org feature list. This is **a trust violation** if a developer lands on TanStack Start and searches the README. Either ship them, or remove the claims.

9. **No "open in Twitter card validator" or "preview on LinkedIn"** button after a render. That is a 1-line CTA and the single most "delightful" thing a developer can do with an OG image.

10. **Pricing page shows "$0, $7, Custom"** but the dashboard checkout button says "$9, $29". **The home page price card and the actual checkout price are inconsistent.** Pick one (the $7 vs $9 inconsistency is also in the docs). This looks unprofessional.

11. **Dark mode is enabled in `tailwind.config.ts` (`darkMode: "class"`) but there is no theme toggle.** Either commit to light-only and remove the config, or ship the toggle.

12. **The dashboard uses `useAuth()` from Clerk in client components** — but you also have server-side `auth()` in `dashboard/layout.tsx`. Mixed pattern. Make it consistent: use server components for read, client mutations for write.

### Wow-factor & 10x moment — where it is and where it should be

The **magic moment** should be: *"I pasted my URL and in 8 seconds I saw 5 beautiful, brand-matched OG images ready to deploy. I clicked one. I copied a code snippet. I'm done."*

Current reality:
- Sign up.
- Land on dashboard.
- Click "Brand Kit" (no guidance).
- Paste URL. Wait 15s with no progress.
- See 5 images that may or may not match your brand (because the extractor is regex).
- Don't know what to do with them.

The moment is real, the wiring is fragile, the demonstration is hidden.

---

## 4. Feature Completeness — what's shipped vs PRD

| PRD feature | Status | Quality |
|---|---|---|
| `POST /api/render` (core API) | Shipped | Working, decent |
| Cache by URL hash | Shipped | 32-bit hash, race in `recordRender` (acceptable) |
| Watermark on free | Shipped | Tasteful SVG bottom-right |
| Magic Onboarding | Partial | Regex-based, serial, hidden |
| Brand Kit editor | Partial | Read-only after extraction, no manual edit UI |
| `@ogsnap/next` SDK | Shipped | 35 lines, correct |
| `@ogsnap/astro` SDK | Shipped | 37 lines, correct |
| `@ogsnap/svelte`, `@ogsnap/remix` | Not shipped | Not shipped; marketing claims them |
| DodoPayments billing | Shipped | Checkout + webhook + portal |
| Dashboard: API keys | Shipped | Real-time, with create/copy/revoke UI |
| Dashboard: usage | Shipped | Real-time via Convex |
| Dashboard: recent renders | Shipped | Real-time with cache stats |
| Dashboard: analytics | Not shipped | No charts, no platform breakdown, no share counts |
| Auto-regeneration on content change | Not shipped | Not shipped |
| Templates (5 built-in) | Not shipped | Only one template shipped; no template picker |
| Webhooks (render.created, etc.) | Not shipped | Not shipped |
| Team seats | Not shipped | Not shipped |
| R2 storage | Shipped | Correct |
| Sitemap | Partial | `robots.ts` references `sitemap.xml` but `sitemap.ts` doesn't exist |
| OpenAPI / API docs | Not shipped | None |
| Discord / community | Not shipped | Mentioned in PRD, not in repo |

For an MVP, the **core is actually 70% complete** for the *render* path. You're 30% on the *brand* path. You're 0% on the *community* and *analytics* moats the docs claim.

---

## 5. The Market Reality (Internet Search Findings)

This is the part where I have to be direct. Your own competitor analysis doc (`docs/20-COMPETITOR-MARKET-ANALYSIS.md`) is **severely outdated and overstated**.

### Real competitive landscape (today)

| Competitor | Scale | Pricing | Threat |
|---|---|---|---|
| **`@vercel/og`** (npm: `@vercel/og`) | **2.2M weekly downloads**, 13.5k stars on Satori, 5.6M weekly on satori itself | Free with Vercel; self-host = free | Dominant. Limited CSS. Next.js only. |
| **`nuxt-og-image`** | 486k weekly downloads, 539 stars, 6.5 version | Free OSS | The "framework-native" model you claim to beat. Now supports Vue templates + Satori + Takumi. |
| **`astro-og-canvas`** | 174k weekly downloads | Free OSS | Renders Canvas/SVG without browser. Pure edge. |
| **`workers-og`** | 103k weekly downloads | Free OSS | Cloudflare Workers. Edge-native. |
| **Bannerbear** | $49–$299/mo, 30 free trial | Marketer-focused, no SDKs | Real incumbent, but they target non-devs |
| **Placid** | $X / credits | Templates + MCP server + ChatGPT | Has a `ChatGPT` integration. Has an MCP server. Is moving into AI. |
| **htmlcsstoimage** | $14–$3,000/mo | General HTML→image | Adjacent |
| **ScreenshotOne** | $17–$259/mo | Screenshot API, includes OG use case | Adjacent, very polished |
| **Firecrawl** | You use them | 130k stars, 1.25M devs | **They ship MCP and agent skills natively. If they add "extract brand" + "render OG," you're done in a quarter.** |

### The hard truth

1. **The "non-Next.js market" thesis is wrong.** Nuxt, Astro, SvelteKit all have native OG modules. The actual underserved market is smaller than you think: mostly Remix and TanStack Start. And TanStack Start just launched and will get its own module in months.

2. **Your differentiator (Magic Onboarding) is not actually different from what Firecrawl's `/scrape` does.** If a developer uses `@vercel/og` + a 10-line Firecrawl call, they get 80% of the magic for free, with zero lock-in.

3. **Placid already has an MCP server.** Placid already has a ChatGPT integration. They are moving into the AI-agent-uses-our-API world faster than you are. By the time you ship MCP, they're on MCP v2.

4. **The moat story in `docs/11-MOAT-DEFENSIBILITY-STRATEGY.md` is largely aspirational.** "Data network effects" require you to have data. You don't, yet. "Template marketplace" requires a community. You don't, yet.

5. **Your pricing is below market** for paid features. Bannerbear charges $49/mo for 1k renders. You charge $9/mo for 1k. That's not a moat; that's a race to the bottom with Vercel's free tier. If your cost-per-render is ~$0.005 (Playwright + R2), $9/mo for 1k renders = $5 margin after costs. **You will go out of business on infra before you get to $10K MRR.**

6. **The product category is real, the timing is right, but the wedge is fragile.** Satori solved "good enough" for Next.js. You're solving "good for everyone else + brand-aware" — that's a real wedge for ~12-18 months, then Satori will be framework-agnostic (Vercel already bought the project) and the wedge closes.

### So is this product needed?

**Yes, but with caveats:**
- Yes, for the *brand extraction* angle. No one owns that wedge yet. Placid has AI features but they're inside their template editor, not API-first.
- Yes, for the *framework-agnostic + AI-extracted* combination. That's your real product, not "OG images for any framework."
- No, if you position as "Vercel OG alternative." You will lose that comparison on every dimension except framework count.

**The market is real but smaller than your PRD claims (~$50M TAM not $500M), and the wedge closes fast.**

---

## 6. AI Features to Add (the 10x path)

The current "AI" surface is one regex-based HTML scraper. That is not AI. Here are the AI features that would actually create the "holy sh*t" moment and defend the company:

### Tier 1 — must ship in the next 4 weeks

1. **AI Brand Extractor (LLM-vision, not regex).**
   Send the rendered homepage screenshot to `claude-sonnet-4-5` or `gpt-4o-mini` with prompt: *"Extract: logo (URL or coordinates), dominant brand color, accent color, font family, brand voice (1 sentence)."* Return JSON. This **replaces the entire 100-line regex block** in `convex/brand/actions.ts` and actually works on modern sites (web components, SPAs, dark mode, gradients). Cost: ~$0.01 per extraction. Bill it as a 1-credit operation, not part of free renders.

2. **AI Template Selection (auto-pick the right template for the URL).**
   Given a URL, classify: blog post / product / docs / portfolio / event. Use the title + meta + URL path as features, call the LLM, pick a template. **This is the feature that lets you say "1 API call, 5 outputs"** in the marketing. Most users don't know which template to pick. Pick for them.

3. **AI Copy Polish on Title/Description.**
   When a user's title is "asdf" or "test", or 200 chars, auto-rewrite for OG (truncate, polish, suggest emoji). One LLM call. Cost ~$0.001. Ship as a `polish: true` query param. **This is the "oh, that's nice" micro-moment.**

4. **AI Alt-Text + Auto Hashtags (Twitter/LinkedIn optimizer).**
   For the same title, generate Twitter-length summary, LinkedIn-length summary, and 3-5 hashtags. Bundle as `meta` in the response. Developers will tweet about this.

### Tier 2 — next 8 weeks

5. **AI Layout Engine (Satori killer).**
   This is the big swing. Replace the hand-coded `convex/render/template.ts:1` HTML template with an LLM that takes `(title, description, brandKit, layoutHint)` and returns `(html, css)`. Cache the (input hash → output) in Convex. The first 1,000 templates are hand-curated and the LLM picks/variations; the LLM only generates new layouts when nothing in the cache matches. **This is the actual 10x.** It also obsoletes Bannerbear's template editor over time.

6. **AI Auto-Rebrand.**
   User pastes a URL, AI looks at the screenshot, suggests: *"Your current primary color is too close to the background. Want me to suggest a contrast fix? Try: #1E3A8A"*. One click, 5 alternate palettes generated. Same engine as #1 but in the "polish" mode.

7. **Multi-platform Composition (the v1.0 PRD promised this, you never shipped it).**
   The PRD says "one API call, seven outputs." Ship:
   - OG (1200×630)
   - Twitter Card large (1200×675)
   - LinkedIn (1200×627)
   - Slack unfurl (1200×630)
   - Discord embed (1200×630)
   - Instagram square (1080×1080)
   - Vertical Story (1080×1920)
   Return a `images: { og: '…', twitter: '…', linkedin: '…', … }` object. One render action, 7 parallel Playwright calls, 7 R2 uploads. **This is the "WTF, one call, seven outputs" headline.**

### Tier 3 — defensibility moat (quarter 2)

8. **AI Performance Oracle.**
   Once you have data on which images get the most clicks, train a model: *"Given your URL, here's the predicted CTR for template A vs B, with these colors."* This is the "data network effects" moat from the docs, **realized**.

9. **AI Agent Skill (MCP).**
   Ship an MCP server so Claude Code, Cursor, and ChatGPT can call `extract_brand`, `render_og`, `list_templates` natively. Placid has it; you don't. **This is table stakes for the next 12 months of dev tools.**

10. **AI Watchdog.**
    Monitor customer sites for brand changes (logo swap, color change). Auto-prompt: *"We noticed you changed your logo last Tuesday. Want us to regenerate your OG images?"* This is a "set and forget" feature that creates retention.

---

## 7. CFO / CMO / CEO view

**CFO:**
- **Gross margin at $9/mo Hobby plan: 0%–40%.** Playwright Chromium is expensive ($5–15 per 1k renders on a hosted service). At 1k renders, your COGS could be $0.50–$5. At scale, you need to (a) move to Satori for most templates (saves 90% on compute) and use Playwright only for the AI-generated templates, (b) price Hobby at $19 not $9, (c) require Satori for the free tier (cheaper) and Playwright for paid. Right now **every free user gets Playwright with a watermark** — that's the most expensive possible default.
- **Pricing is a race to the bottom with Vercel free.** Satori-style rendering at $9/mo is a loss leader. Either own the Satori path (it's MIT-licensed; you can build it) or charge 3x.

**CMO:**
- **The home page is good, the SEO is good, the AEO (robots.txt allowing AI crawlers) is good.** But the home page's #1 feature card is a static mockup, not a live demo of the magic. **Make the magic be the hero.** A 30-second autoplay video of "URL → 5 images" would 5x your conversion.
- **You are undersold on the multi-platform story.** "One call, 7 outputs" is a one-line tagline. Push it.
- **The keywords strategy is good but the meta description is generic** ("Generate production-ready Open Graph images in 3 lines"). Make it more specific: *"API that extracts your brand from any URL and generates 5 on-brand OG images in 8 seconds. Next.js, Astro, SvelteKit, Remix, TanStack Start."*

**CEO:**
- **The wedge is real but the clock is ticking.** Vercel will ship framework-agnostic Satori in the next 12 months. Placid is moving into AI. Firecrawl is 2 quarters from adding "render OG" as a one-call API. **You have 12 months to be the brand-aware, framework-agnostic, AI-first OG tool.** After that, you're a commodity Playwright wrapper.
- **Don't ship the SvelteKit/Remix/TanStack Start SDKs as table stakes.** Ship one (SvelteKit — biggest community). Make the others a "request beta" link. The home page's "5+ frameworks" claim is currently a liability, not an asset.
- **The Plan B is real.** If magic onboarding doesn't land, pivot to: *"OGSnap = the cheapest, fastest, most reliable OG image API. $19/mo Pro, 10k renders, Satori-backed, 50ms cache hits."* That's a real business. Don't let pride kill it.

**CTO:**
- **Stop running Chromium for free users.** The free tier should be Satori (or even Canvas). Playwright is for paid. This single change makes the unit economics work.
- **Add Satori as a rendering backend now.** It's MPL-2.0, mature, used by Vercel. You can ship a `?engine=satori` param next week. **This buys you 90% cost reduction overnight.** Add it for cache-warmup; use Playwright only when Satori's CSS subset is insufficient.
- **Add edge caching.** Cloudflare Worker in front of `/v1/render` that returns cached `imageUrl` based on `cacheKey` from a KV lookup, before it ever hits Convex. This is the difference between 50ms and 300ms P50.

---

## 8. Prioritized Action List

| # | Action | Effort | Impact | Sprint |
|---|---|---|---|---|
| 1 | Replace regex brand extractor with vision LLM call | 2 days | Critical | 0 |
| 2 | Make Magic Onboarding the home page hero (not buried) | 0.5 day | Critical | 0 |
| 3 | Fix `dashboard/queries` auth — remove direct query, use HTTP only | 0.5 day | Security | 0 |
| 4 | Fix cache key to SHA-256 (or document 32-bit limitation) | 0.5 day | High | 0 |
| 5 | Parallelize magic-onboarding 5 previews with progress streaming | 1 day | High | 0 |
| 6 | Rename `MagicOnboarding` (home demo) to `LiveRenderDemo` to stop misleading users | 0.1 day | High | 0 |
| 7 | Remove "5+ frameworks" claim OR ship SvelteKit SDK | 1 day | High | 0 |
| 8 | Fix price mismatch (home $7 vs checkout $9 vs docs $9) | 0.1 day | Medium | 0 |
| 9 | Add Satori rendering backend for free tier (cost control) | 3 days | Critical | 1 |
| 10 | Add multi-platform outputs (7 sizes, one call) | 1 week | High | 1 |
| 11 | Ship "Open in Twitter Validator" + "Open in LinkedIn Debugger" buttons | 0.5 day | Medium | 1 |
| 12 | Add `sitemap.ts` (referenced in robots but missing) | 0.1 day | Low (SEO) | 1 |
| 13 | Split `renderLogs` into `cache` + `audit` tables | 1 day | High | 2 |
| 14 | Add MCP server | 1 week | Defensibility | 2 |
| 15 | Ship SvelteKit SDK (kill "5+ frameworks" liability) | 3 days | High | 2 |
| 16 | Add AI Copy Polish (title truncation, hashtag generation) | 2 days | Wow | 2 |
| 17 | Ship `v1.1` with templates + webhooks per PRD | 2 weeks | High | 3 |
| 18 | Fix `useAuth` vs `auth()` server/client pattern | 0.5 day | Medium | 3 |
| 19 | Add visual regression tests for template output | 1 week | Quality | 3 |
| 20 | Add Vercel edge cache (Workers) for `imageUrl` return | 1 week | Performance | 4 |

---

## 9. Final Score

| Dimension | Score (10) | Note |
|---|---|---|
| Backend architecture | 8 | Convex split is right, cache key is weak |
| Renderer microservice | 7 | Works, will need Satori backend for cost |
| Security | 5 | `dashboard/queries` auth gap is a P0 |
| Code quality | 7 | Tight types, no `any` in hot path, but 4 ways to call backend |
| UI/UX polish | 6 | Marketing is good, dashboard is incomplete |
| User flow | 4 | Magic Onboarding is hidden, demo is misleading |
| Wow factor | 2 | Regex extractor is not AI; demo doesn't demo |
| Feature completeness vs PRD | 6 | Core 70%, moat 0% |
| Market positioning | 5 | Wedge real, claims overstated |
| AI readiness | 1 | The "AI" feature is regex. No LLM anywhere. |
| Cost economics | 4 | Free tier burns Playwright; will bleed at scale |
| Defensibility | 3 | No moat in code yet. 12-month window. |

**Overall: 5/10 — a real, working MVP with a great backend foundation and a broken differentiator. The single highest-leverage change is replacing the regex brand extractor with a vision LLM and making Magic Onboarding the first thing on the home page. Do that this week and you have a product that can actually launch.**

---

## 10. Task Breakdown with Acceptance Criteria

### Sprint 0 — Critical Fixes (Week 1)

#### TASK-001: Fix `dashboard/queries` authorization (P0 Security)
**Priority:** P0 (Security)
**Owner:** Backend
**Effort:** 0.5 day
**Files:** `convex/dashboard/queries.ts`, `apps/web/src/lib/dashboard-live.ts`, `apps/web/src/app/dashboard/keys/page.tsx`, `apps/web/src/app/dashboard/renders/page.tsx`

**Description:** Remove public Convex queries `getKeysPanelByClerkId` and `getRendersPanelByClerkId` that trust a client-supplied `clerkId`. Route all dashboard reads through the authenticated HTTP endpoints.

**Acceptance Criteria:**
- [ ] `convex/dashboard/queries.ts` is deleted or contains no export that accepts `clerkId` as a public argument.
- [ ] `apps/web/src/lib/dashboard-live.ts` no longer references `dashboard/queries:*` functions.
- [ ] `apps/web/src/app/dashboard/keys/page.tsx` and `renders/page.tsx` call the `/v1/internal/dashboard` HTTP route via a new typed wrapper that forwards the Clerk session token and `x-internal-secret` header.
- [ ] A request with mismatched `clerkId` (impersonation attempt) returns 401/403.
- [ ] Manual test: log in as user A, attempt `POST /v1/internal/dashboard` with user B's `clerkId` in the body, verify it is rejected.
- [ ] No regression: existing dashboard pages still render for the logged-in user.

---

#### TASK-002: Replace regex brand extractor with vision LLM (P0 Wow Factor)
**Priority:** P0 (Differentiation)
**Owner:** Backend + AI
**Effort:** 2 days
**Files:** `convex/brand/actions.ts`, new `convex/lib/llm.ts`, new env vars

**Description:** Replace the 100-line regex block in `extractFromUrl` with a vision LLM call. Take a Playwright screenshot of the URL, send to a vision-capable model (Claude Sonnet 4.5 or GPT-4o-mini), ask for structured extraction of `(logoUrl, primaryColor, backgroundColor, fontFamily, accentColor)`, and persist.

**Acceptance Criteria:**
- [ ] New env var `VISION_LLM_PROVIDER` (`anthropic` | `openai`) and matching API key (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`) are added to `.env.example` and `scripts/preflight.mjs`.
- [ ] New file `convex/lib/llm.ts` exposes `extractBrandFromScreenshot(screenshotBuffer): Promise<ExtractedBrand>`.
- [ ] `convex/brand/actions.ts` `extractFromUrl` is rewritten: it fetches the page via Firecrawl, takes a Playwright screenshot, calls the vision LLM, and returns the structured result. Falls back to the current regex extractor only if the LLM call fails.
- [ ] The fallback path logs a warning and increments a `brandExtractionMethod` field (`"vision"` | `"regex-fallback"`) on the `brandKits` table.
- [ ] On 5 real test sites (e.g., vercel.com, stripe.com, linear.app, anthropic.com, supabase.com), the vision LLM extracts: at least one valid logo URL (or "no logo" with confidence), a primary color within 10% perceptual distance from the actual brand color, and a recognizable font family.
- [ ] Cost is logged per call (input tokens + output tokens) and stored on the `brandKits` row for unit-economics analysis.
- [ ] `pnpm typecheck` and `pnpm lint` pass.

---

#### TASK-003: Promote Magic Onboarding to home page hero
**Priority:** P0 (Wow Factor)
**Owner:** Frontend
**Effort:** 0.5 day
**Files:** `apps/web/src/app/page.tsx`, possibly `apps/web/src/components/onboarding/`

**Description:** Move the Magic Onboarding interactive card to the first fold of the home page, above the fold. Replace the static "Live Render Preview" mockup with a real interactive widget.

**Acceptance Criteria:**
- [ ] On a 1280×800 viewport, the Magic Onboarding input + button is fully visible without scrolling.
- [ ] The "OG images in 3 lines. Every modern JS framework." badge and headline remain above the fold.
- [ ] The interactive component uses the **real** magic endpoint (not `/api/demo-render`).
- [ ] When a user pastes a URL and submits, they see a loading state with "Extracting brand…" then "Generating preview 1 of 5…" progress, then the 5 brand-matched images.
- [ ] CTA below the result: "Save to your account — free" (links to sign-up flow that preserves the URL).
- [ ] Lighthouse Performance score on `/` stays ≥ 90 on desktop.
- [ ] First Contentful Paint < 1.5s on a 4G connection.

---

#### TASK-004: Fix cache key collision risk
**Priority:** P1 (Reliability)
**Owner:** Backend
**Effort:** 0.5 day
**Files:** `convex/lib/cache.ts`, `convex/schema.ts`, possibly migration

**Description:** Replace the 32-bit djb2 hash in `buildRenderCacheKey` with SHA-256 (already imported in `convex/lib/security.ts`). Truncate to 16 hex chars (64 bits) which is collision-safe up to ~4 billion entries.

**Acceptance Criteria:**
- [ ] `convex/lib/cache.ts` `buildRenderCacheKey` returns a 16-character lowercase hex string.
- [ ] A unit test confirms: for 10,000 unique input combinations, all 10,000 cache keys are unique.
- [ ] The `renderLogs` table (or new `renderCache` table — see TASK-013) indexed on `cacheKey` accommodates the longer value without schema change.
- [ ] Existing cache rows from the old 8-char scheme are migrated or invalidated (one-time script or "cache bust on deploy" flag).
- [ ] No regression in cache hit rate (smoke test still reports a HIT on second call).

---

#### TASK-005: Parallelize magic-onboarding 5 previews with progress streaming
**Priority:** P1 (Performance + UX)
**Owner:** Backend + Frontend
**Effort:** 1 day
**Files:** `convex/onboarding/http.ts`, new streaming endpoint, `apps/web/src/components/brand/brand-onboarding.tsx`

**Description:** Replace the serial `for` loop with `Promise.allSettled` so all 5 previews render in parallel. Stream progress to the client via Server-Sent Events or chunked transfer so the user sees "Preview 1 ready" → "Preview 2 ready" → … as each completes.

**Acceptance Criteria:**
- [ ] 5 previews complete in roughly the time of 1 (≤ 1.5× the slowest single render), measured on local dev with sample data.
- [ ] Each completed preview appears in the UI within 200ms of its render finishing (no waiting for all 5).
- [ ] If 1 preview fails, the other 4 still render and are shown. The failure is listed under "warnings" with a "retry" button for that single image.
- [ ] Total wall-clock time from URL submit to all 5 images visible is < 8 seconds on local dev (target) / < 12 seconds on production render path.
- [ ] Frontend handles stream disconnects gracefully (shows error after 30s timeout, allows retry).

---

#### TASK-006: Rename misleading `MagicOnboarding` component
**Priority:** P1 (UX/Trust)
**Owner:** Frontend
**Effort:** 0.1 day
**Files:** `apps/web/src/components/onboarding/magic-onboarding.tsx`, `apps/web/src/app/page.tsx`

**Description:** Rename the home page demo component (which only does a basic render, no brand extraction) from `MagicOnboarding` to `LiveRenderDemo`. The real Magic Onboarding component on the dashboard stays named `BrandOnboarding` (it actually does extraction).

**Acceptance Criteria:**
- [ ] File `apps/web/src/components/onboarding/magic-onboarding.tsx` is renamed to `live-render-demo.tsx`.
- [ ] The exported component name is `LiveRenderDemo`.
- [ ] The component's UI copy is updated: the badge says "Try It Live" (already there), the heading says "Live Render Demo" (replacing "Magic Onboarding Demo"), and a subhead clarifies: *"Renders a basic OG image in 3 lines. For brand-matched previews, sign up and use Magic Onboarding."*
- [ ] `apps/web/src/app/page.tsx` imports from the new path.
- [ ] `pnpm typecheck` passes.

---

#### TASK-007: Reconcile framework claims with reality
**Priority:** P1 (Trust/Compliance)
**Owner:** Marketing + Frontend
**Effort:** 1 day
**Files:** `apps/web/src/app/page.tsx`, `apps/web/src/app/page.tsx` (keywords), `docs/01-PRD.md`, possibly ship SvelteKit SDK

**Description:** The home page and SEO meta claim "5+ frameworks" (Next.js, Astro, SvelteKit, Remix, TanStack Start) but only Next.js and Astro SDKs are shipped. Either ship SvelteKit SDK (the highest-traffic missing framework) or downgrade the claim.

**Acceptance Criteria (Option A — ship SvelteKit SDK):**
- [ ] New package `packages/svelte` is added to the monorepo.
- [ ] SDK exposes `OGEndpoint({ apiKey, baseUrl? })` matching the `astro` and `next` SDKs' API surface.
- [ ] README includes a 5-line integration example for SvelteKit.
- [ ] Home page keywords updated to remove "remix" and "tanstack start" if those aren't shipped, OR add those packages and ship them too.
- [ ] CI builds the new package.

**Acceptance Criteria (Option B — downgrade claim):**
- [ ] Home page "Framework coverage" card lists only Next.js and Astro.
- [ ] SEO keywords and `keywords` array in metadata drop SvelteKit, Remix, TanStack Start.
- [ ] schema.org `featureList` updated to remove the false claims.
- [ ] FAQ answer for "Which frameworks are supported?" is updated to match.

**Decision criterion:** if TASK-015 (SvelteKit SDK) is in this sprint, do Option A. Otherwise Option B.

---

#### TASK-008: Fix price mismatch across surfaces
**Priority:** P1 (Trust/Professionalism)
**Owner:** Frontend + Marketing
**Effort:** 0.1 day
**Files:** `apps/web/src/app/page.tsx`, `apps/web/src/components/dashboard/billing-actions.tsx`, `docs/01-PRD.md`, `docs/02-MVP.md`

**Description:** Reconcile the price shown on the home page pricing card ($7/mo Hobby, $29/mo Pro) with the actual checkout button labels ($9/mo Hobby, $29/mo Pro) and the docs.

**Acceptance Criteria:**
- [ ] Single source of truth: `lib/pricing.ts` exports a typed `PLANS` array with `{ id, name, priceMonthly, features, ctaLabel, checkoutHref, highlight }`.
- [ ] Home page pricing card consumes `PLANS` and renders prices from it.
- [ ] `BillingActions` component reads from `PLANS` for button labels.
- [ ] `docs/01-PRD.md` and `docs/02-MVP.md` updated to match.
- [ ] If the $7 → $9 decision is firm, update the home page copy to say $9 (and use $9 in CTA buttons). If $7 is the target, update `BillingActions` to say $7 and add a note in the dashboard billing page explaining the price.
- [ ] Manual check: home page, dashboard billing, and at least one email confirmation all show the same price.

---

### Sprint 1 — Cost Economics & Multi-Platform (Week 2-3)

#### TASK-009: Add Satori as a rendering backend
**Priority:** P0 (Cost)
**Owner:** Backend + Infra
**Effort:** 3 days
**Files:** `apps/renderer/` (new Satori mode), `convex/render/actions.ts`, `convex/render/template.ts`, env config

**Description:** Add Satori as an alternate rendering path. Free-tier renders and cache-warmup go through Satori (cheap, fast, no browser). Paid-tier and AI-template renders still go through Playwright. Add `?engine=satori` query param support.

**Acceptance Criteria:**
- [ ] `@satori` and a default font (Inter) are added to `apps/renderer/package.json`.
- [ ] New route `POST /render-satori` in `apps/renderer/src/index.ts` accepts `{ jsx, width, height, format }` and returns a PNG buffer (using `satori-html` for HTML→JSX and `resvg-js` for SVG→PNG).
- [ ] `convex/render/actions.ts` `generateImage` checks `args.plan === "free"` (or a per-request `engine` override) and routes to Satori path instead of Playwright.
- [ ] For the default template, both Satori and Playwright produce visually similar output (≥ 95% structural similarity on a sample of 10 titles). Difference is acceptable due to font hinting.
- [ ] Free-tier render P95 latency ≤ 200ms (vs current ~1.5s with Playwright).
- [ ] Cost per 1k free-tier renders ≤ $0.05 (vs ~$5 with Playwright).
- [ ] Smoke test confirms: a free-tier user hitting `/v1/render` gets a Satori-rendered image; a `pro` plan user gets Playwright.
- [ ] Cache layer works the same regardless of engine (same `cacheKey` shape).

---

#### TASK-010: Multi-platform outputs in one call
**Priority:** P1 (Wow Factor)
**Owner:** Backend + Frontend
**Effort:** 1 week
**Files:** `convex/render/actions.ts`, `convex/render/http.ts`, `packages/core/src/types.ts`, new `convex/render/multi-template.ts`, frontend response handling

**Description:** When the client passes `?multi=true` (or `platforms: ["og","twitter","linkedin",...]`), the API returns a `images: { og, twitter, linkedin, slack, discord, square, story }` object. The 7 sizes render in parallel within the same action.

**Acceptance Criteria:**
- [ ] New `packages/core/src/types.ts` `RenderResponse` has a discriminated union: `RenderResponseSingle | RenderResponseMulti`.
- [ ] `convex/render/actions.ts` accepts `platforms: v.optional(v.array(v.union(...)))` and renders each in parallel via `Promise.all`.
- [ ] Output dimensions match the canonical sizes: 1200×630, 1200×675, 1200×627, 1200×630, 1200×630, 1080×1080, 1080×1920.
- [ ] Each platform uses a layout tuned to its aspect ratio (vertical for story, square for Instagram, etc.).
- [ ] Cache key includes the platform set, so a request for just `og` doesn't return all 7 from cache.
- [ ] Wall-clock time for all 7 (Playwright) ≤ 3 seconds on the warmed pool; Satori path ≤ 1 second.
- [ ] Smoke test: a request with `platforms: ["og","twitter","linkedin"]` returns a JSON body with 3 image URLs, all resolvable.
- [ ] `pnpm smoke:deploy` extended to cover the multi-platform path.
- [ ] Home page hero copy updated to: "One call. Seven platforms."
- [ ] schema.org `featureList` updated.

---

#### TASK-011: "Open in Twitter Validator" + "Open in LinkedIn Debugger" buttons
**Priority:** P2 (Delight)
**Owner:** Frontend
**Effort:** 0.5 day
**Files:** `apps/web/src/components/dashboard/renders-table.tsx` or new detail modal, `apps/web/src/app/page.tsx` demo section

**Description:** After a successful render, show two buttons: "Preview on Twitter" (links to `https://cards-dev.twitter.com/validator?url={encoded_imageUrl}`) and "Preview on LinkedIn" (links to `https://www.linkedin.com/post-inspector/inspect/{encoded_imageUrl}`). For Facebook, the Open Graph Debugger.

**Acceptance Criteria:**
- [ ] Each render row in the dashboard has two icon buttons: Twitter (X logo) and LinkedIn (in logo).
- [ ] Clicking opens the validator in a new tab, pre-populated with the rendered image URL.
- [ ] The home page `LiveRenderDemo` (after a successful render) shows the same two buttons below the preview image.
- [ ] Buttons disabled if the render is a cache hit AND the image URL is older than 7 days (so users don't validate stale images) — or add a tooltip explaining cache state.

---

#### TASK-012: Add missing `sitemap.ts`
**Priority:** P3 (SEO)
**Owner:** Frontend
**Effort:** 0.1 day
**Files:** new `apps/web/src/app/sitemap.ts`

**Description:** `apps/web/src/app/robots.ts:44` references `${siteUrl}/sitemap.xml` but no `sitemap.ts` exists. Add a basic sitemap that includes the home page and any public marketing pages.

**Acceptance Criteria:**
- [ ] New file `apps/web/src/app/sitemap.ts` exports a default function returning `MetadataRoute.Sitemap`.
- [ ] Sitemap includes `/`, `/signup`, `/login`, and any other public route.
- [ ] `lastModified` is set to the current date.
- [ ] `pnpm build` succeeds and `/sitemap.xml` returns a valid XML response.
- [ ] Validate with `curl https://ogsnap.dev/sitemap.xml` after deploy.

---

### Sprint 2 — Schema Split, MCP, AI Polish (Week 4-5)

#### TASK-013: Split `renderLogs` into `renderCache` + `renderAudit`
**Priority:** P1 (Performance + Data Hygiene)
**Owner:** Backend
**Effort:** 1 day
**Files:** `convex/schema.ts`, `convex/render/queries.ts`, `convex/render/mutations.ts`, dashboard renders page

**Description:** Separate concerns: `renderCache` (TTL-aware, key → imageUrl lookup, no user metadata, eventually evicted) and `renderAudit` (long-lived, full event log, indexed by user for dashboard). Update cache reads to query `renderCache` first, fall through to `renderAudit` only for historical view.

**Acceptance Criteria:**
- [ ] New `renderCache` table: `{ cacheKey, imageUrl, renderTimeMs, lastHitAt, expiresAt, hitCount }`. Indexed by `cacheKey`.
- [ ] New `renderAudit` table: `{ userId, apiKeyId, originalUrl, title, description, template, imageUrl, renderTimeMs, cacheHit, createdAt }`. Indexed by `userId`, `cacheKey`, `createdAt`.
- [ ] Migration script: existing `renderLogs` rows are moved to `renderAudit` (no data loss).
- [ ] `recordRender` writes to BOTH tables (cache + audit).
- [ ] `getCachedRender` queries only `renderCache` and only rows where `expiresAt > now`.
- [ ] Optional: cron action that deletes `renderCache` rows where `expiresAt < now` (daily).
- [ ] Dashboard "Renders" page reads from `renderAudit`.
- [ ] Existing `getCachedRender` smoke test still returns a HIT on the second call.

---

#### TASK-014: Ship MCP server
**Priority:** P0 (Defensibility)
**Owner:** Backend + DevRel
**Effort:** 1 week
**Files:** new `apps/mcp/` (or `packages/mcp/`), `mcp.json` updated, docs

**Description:** Ship a Model Context Protocol server that exposes `extract_brand`, `render_og`, `list_templates`, `get_render` to MCP-compatible clients (Claude Code, Cursor, ChatGPT). Already partially scaffolded in `mcp.json` (Convex + Firecrawl + Dodo + Cloudflare MCPs) but no OGSnap MCP yet.

**Acceptance Criteria:**
- [ ] New package `apps/mcp` (or `packages/mcp`) with its own `package.json`, `tsconfig.json`, and `src/index.ts`.
- [ ] MCP server starts via `pnpm --filter @ogsnap/mcp dev` and connects over stdio.
- [ ] Tools exposed:
  - `extract_brand({ url })` → calls Convex `/v1/onboarding/magic` and returns brand + previews
  - `render_og({ url, title, description, template? })` → calls Convex `/v1/render` and returns image URL
  - `list_templates()` → returns available template names
  - `get_render({ id })` → returns render details by id
- [ ] Authentication: MCP server reads `OGSNAP_API_KEY` from env; passes as Bearer to the Convex HTTP routes.
- [ ] `mcp.json` updated to include the new OGSnap MCP server.
- [ ] `docs/27-AGENTIC-AI-STRATEGY.md` updated with example agent workflow.
- [ ] README section "Use with Claude Code / Cursor" added to root README.
- [ ] Manual test: from Claude Code, `extract_brand` on `https://stripe.com` returns Stripe's brand within 10s.

---

#### TASK-015: Ship SvelteKit SDK
**Priority:** P1 (Trust/Feature parity)
**Owner:** SDK
**Effort:** 3 days
**Files:** new `packages/svelte/`, workspace config, home page

**Description:** Add a `@ogsnap/svelte` package mirroring `@ogsnap/next` and `@ogsnap/astro`. Provides a SvelteKit endpoint hook that proxies to the OGSnap API.

**Acceptance Criteria:**
- [ ] New package `packages/svelte/` with `package.json` (`@ogsnap/svelte`), `tsconfig.json`, and `src/index.ts`.
- [ ] Exports `OGEndpoint({ apiKey, baseUrl?, defaultTemplate? })` returning a SvelteKit-compatible request handler.
- [ ] `pnpm-workspace.yaml` includes the new package.
- [ ] README in the package with 5-line SvelteKit integration example.
- [ ] Home page "Framework coverage" card now lists Next.js, Astro, SvelteKit as shipped.
- [ ] SEO keywords and `featureList` updated.
- [ ] `pnpm build` succeeds for the new package.

---

#### TASK-016: AI Copy Polish
**Priority:** P1 (Wow)
**Owner:** Backend + AI
**Effort:** 2 days
**Files:** `convex/render/actions.ts`, `convex/lib/llm.ts`, `packages/core/src/types.ts`, frontend

**Description:** When a request comes in with `polish: true`, run a one-shot LLM call that improves the title (truncate, clean up, suggest emoji where appropriate) and generates platform-specific descriptions (Twitter-length, LinkedIn-length, hashtags) before rendering. Add an `aiSuggestions` field to the response.

**Acceptance Criteria:**
- [ ] New env var `POLISH_LLM_PROVIDER` and API key (re-use `VISION_LLM_PROVIDER` if same provider).
- [ ] `convex/lib/llm.ts` exports `polishCopy({ title, description, url }): Promise<{ polishedTitle, polishedDescription, twitterSummary, linkedinSummary, hashtags }>`.
- [ ] `convex/render/actions.ts` accepts `polish: v.optional(v.boolean())` and calls `polishCopy` before building HTML.
- [ ] Response includes `aiSuggestions: { polishedTitle, twitterSummary, linkedinSummary, hashtags }` (even if `polish: false`, suggest the field is null).
- [ ] Cost per polish call ≤ $0.001.
- [ ] Latency overhead ≤ 500ms on P50.
- [ ] Smoke test: a request with `polish: true, title: "asdf"` returns a polished title in `aiSuggestions.polishedTitle`.
- [ ] Dashboard "Renders" page optionally shows a small "✨ AI polished" badge for renders that used the feature.

---

### Sprint 3 — Templates, Webhooks, Hardening (Week 6-7)

#### TASK-017: Ship v1.1 features (templates + webhooks)
**Priority:** P1 (PRD delivery)
**Owner:** Backend + Frontend
**Effort:** 2 weeks
**Files:** new `convex/render/templates.ts`, `convex/render/webhooks.ts`, schema updates, dashboard

**Description:** Fulfill the v1.1 PRD: 5 built-in templates (minimal, bold, gradient, dark, editorial) selectable by URL type or via `?template=...` param. Webhook system: `render.created`, `render.cached`, `usage.threshold` events with user-configured endpoints and HMAC signing.

**Acceptance Criteria:**

**Templates:**
- [ ] 5 templates ship as separate files under `convex/render/templates/`. Each exports a `buildHtml({ title, description, brandKit, ... })` function.
- [ ] `template` query param on `/v1/render` selects the template.
- [ ] Default template is auto-selected based on URL path heuristics (e.g., `/blog/...` → editorial, `/product/...` → bold, root → minimal).
- [ ] Each template renders correctly in both Playwright and Satori paths.
- [ ] Dashboard "Brand Kit" page shows template previews for the user's brand.

**Webhooks:**
- [ ] New `webhooks` table: `{ userId, url, events: string[], secret, createdAt, lastTriggeredAt, failureCount }`.
- [ ] New `webhookDeliveries` table: `{ webhookId, eventType, payload, responseStatus, responseBody, attempt, createdAt }`.
- [ ] `render.created` fires on every successful render. `render.cached` fires on cache hit. `usage.threshold` fires at 80% and 100% of plan limit.
- [ ] Each webhook delivery is HMAC-signed with `secret`; receiver verifies via `X-OGSnap-Signature` header.
- [ ] Failed deliveries are retried with exponential backoff (1m, 5m, 30m, 2h, 12h) up to 5 attempts.
- [ ] Dashboard "Webhooks" page lists configured webhooks, recent deliveries, and a "test" button.

---

#### TASK-018: Unify `useAuth` vs `auth()` server/client pattern
**Priority:** P2 (Code hygiene)
**Owner:** Frontend
**Effort:** 0.5 day
**Files:** `apps/web/src/app/dashboard/keys/page.tsx`, `apps/web/src/app/dashboard/renders/page.tsx`, possibly all dashboard pages

**Description:** Make a consistent pattern: server components do reads via `auth()` and pass userId down as props. Client components only do mutations.

**Acceptance Criteria:**
- [ ] No dashboard page uses `useAuth()` from Clerk on the client.
- [ ] All dashboard reads happen in server components; data is passed down as props.
- [ ] Client components receive typed props (e.g., `initialKeys: KeyRow[]`) and use Convex mutations for writes.
- [ ] Convex `useQuery` is only used for real-time updates (e.g., usage counter).
- [ ] Pages remain SSR-friendly (no client-only data fetching for initial render).

---

#### TASK-019: Visual regression tests for template output
**Priority:** P2 (Quality)
**Owner:** QA
**Effort:** 1 week
**Files:** new `apps/renderer/tests/visual/`, CI config

**Description:** Add Playwright-based visual regression tests that render a known set of (title, brand, template) combinations and compare against golden PNGs.

**Acceptance Criteria:**
- [ ] Test suite in `apps/renderer/tests/visual/` with at least 20 test cases: 4 titles × 2 brand kits × 2 templates.
- [ ] Each test renders the image, computes a perceptual hash (pHash), and compares to a stored hash in `tests/visual/snapshots/`.
- [ ] Test runs in CI on every PR; failure blocks merge.
- [ ] Snapshot update command documented: `pnpm test:visual:update`.
- [ ] Tolerance: ≤ 1% pixel difference allowed (to absorb Chromium minor rendering differences).
- [ ] Tests run in ≤ 60 seconds total.

---

### Sprint 4 — Performance & Polish (Week 8+)

#### TASK-020: Vercel edge cache for `imageUrl` return
**Priority:** P2 (Performance)
**Owner:** Infra
**Effort:** 1 week
**Files:** new Cloudflare Worker or Vercel Edge Middleware, env config

**Description:** Add a CDN edge in front of `/v1/render` that returns a cached `imageUrl` based on the `cacheKey` without round-tripping to Convex. This drops cache-hit P50 from ~50ms to < 10ms.

**Acceptance Criteria:**
- [ ] Cloudflare Worker (or Vercel Edge Function) sits in front of the render endpoint.
- [ ] On request, worker computes `cacheKey` from `(apiKeyId, url, title, description, template, width, height)`, checks Cloudflare KV, and returns the stored `imageUrl` directly if present.
- [ ] On miss, request forwards to Convex and the response is written back to KV with TTL = plan-appropriate (24h for free, 7d for pro, 30d for scale).
- [ ] Edge cache hit measured P50 < 10ms globally.
- [ ] Cache invalidation: a `POST /api/cache/purge?url=...` endpoint clears the KV entries for a given URL.
- [ ] Smoke test: a request made from two regions returns the same `imageUrl` and the second has `X-Edge-Cache: HIT` header.

---

#### TASK-021: Dev bootstrap production guard
**Priority:** P1 (Safety)
**Owner:** Backend
**Effort:** 0.2 day
**Files:** `convex/dev/http.ts`

**Description:** Replace `process.env.NODE_ENV === "production"` check with a check against `CONVEX_DEPLOYMENT` name (e.g., must NOT contain "prod" to allow dev bootstrap) OR require an additional `ALLOW_DEV_BOOTSTRAP=1` env var.

**Acceptance Criteria:**
- [ ] `convex/dev/http.ts` returns 404 if `process.env.CONVEX_DEPLOYMENT` contains "prod" (case-insensitive) OR if `ALLOW_DEV_BOOTSTRAP !== "1"`.
- [ ] Default local dev `convex dev` still works (deployments named "dev:*" or similar).
- [ ] Production deployments have `CONVEX_DEPLOYMENT=prod:ogsnap` and dev bootstrap returns 404.
- [ ] Manual test: try `curl` against prod with the secret, verify 404.

---

#### TASK-022: Add smoke test for dev fallback (data URL)
**Priority:** P2 (Test coverage)
**Owner:** QA
**Effort:** 0.2 day
**Files:** `scripts/smoke-render.ts`, `scripts/smoke-deploy.mjs`

**Description:** The current smoke test rejects data URLs in prod. Add a local-mode smoke test that explicitly exercises the dev fallback path and confirms a data URL is returned when R2 is not configured.

**Acceptance Criteria:**
- [ ] `scripts/smoke-render.ts` (local) tolerates data URLs and prints a warning if R2 is not configured.
- [ ] `scripts/smoke-deploy.mjs` (prod) still rejects data URLs.
- [ ] CI runs both: `smoke:local` then `smoke:deploy`.
- [ ] README updated with the new test commands.

---

#### TASK-023: Brand Kit manual edit UI
**Priority:** P2 (UX)
**Owner:** Frontend
**Effort:** 1 day
**Files:** `apps/web/src/app/dashboard/brand/page.tsx`, `apps/web/src/components/brand/`

**Description:** Today the Brand Kit is read-only after Magic Onboarding. Add manual edit controls so users can override logo (file upload), colors (color picker), and font (dropdown).

**Acceptance Criteria:**
- [ ] Color picker for primary, background, and accent colors. Updates persist to Convex on change.
- [ ] Logo upload: drag-and-drop or file picker, max 2MB PNG/SVG. Uploads to R2 via a new `/v1/brand/logo` HTTP route.
- [ ] Font dropdown: lists 5–10 curated fonts (Inter, Geist, Playfair Display, JetBrains Mono, etc.). Selecting one updates the brand kit.
- [ ] "Re-extract from URL" button: re-runs Magic Onboarding for the stored URL, with a confirmation modal warning that manual edits will be overwritten.
- [ ] Live preview: as the user edits, a small inline preview of the OG image re-renders (debounced 500ms).
- [ ] Form is fully accessible (labels, focus order, ARIA).
- [ ] No regression: existing Magic Onboarding flow still works.

---

#### TASK-024: AI Layout Engine (Satori killer)
**Priority:** P0 (Defensibility — Tier 2 AI feature)
**Owner:** AI + Backend
**Effort:** 2 weeks
**Files:** `convex/render/actions.ts`, `convex/lib/llm.ts`, new `convex/render/ai-template-cache.ts`, new `convex/render/templates-ai.ts`

**Description:** When the user passes `?engine=ai` (or it's the user's default), the render flow asks an LLM to generate a custom HTML/CSS layout for `(title, description, brandKit, layoutHint)`. The result is cached in Convex. First 1,000 templates are hand-curated; AI generates variations.

**Acceptance Criteria:**
- [ ] New env var `LAYOUT_LLM_PROVIDER` and API key.
- [ ] `convex/render/ai-template-cache.ts` implements `(inputHash) → (html, css, version)` lookup with version-based invalidation.
- [ ] `convex/render/actions.ts` accepts `engine: v.optional(v.union(v.literal("playwright"), v.literal("satori"), v.literal("ai")))`.
- [ ] AI engine: builds prompt, calls LLM, parses JSON response `{ html, css, layout }`, validates (no script tags, no unsafe URLs), caches, and renders.
- [ ] LLM-generated HTML passes the same `escapeHtml` safety check on all user inputs.
- [ ] Cost per AI render ≤ $0.02 (excluding Playwright compute).
- [ ] Latency overhead ≤ 1.5s (P50) for the LLM call.
- [ ] Guardrails: max 1 AI render per 5 seconds per user (rate limit) to prevent abuse.
- [ ] Smoke test: `?engine=ai` returns a render with `meta.engine === "ai"`.
- [ ] A "Design Library" page in the dashboard shows the last 20 AI-generated layouts the user has used, with a "re-roll" button.

---

#### TASK-025: MCP server OAuth / per-user authentication
**Priority:** P2 (Enterprise readiness)
**Owner:** Backend
**Effort:** 1 week
**Files:** `apps/mcp/`, new auth flow

**Description:** Currently MCP uses a single shared `OGSNAP_API_KEY`. Add per-user auth so each MCP user can have their own key + usage tracked.

**Acceptance Criteria:**
- [ ] MCP server accepts either `OGSNAP_API_KEY` env (single-tenant mode) or an OAuth flow (multi-tenant).
- [ ] OAuth flow: user clicks "Connect to Claude Code" in dashboard, gets a per-user token, pastes into MCP client config.
- [ ] Per-user token is stored as a `mcpTokens` table: `{ userId, tokenHash, label, lastUsedAt, expiresAt }`.
- [ ] MCP server rate-limits per token (matches dashboard plan limits).
- [ ] Usage from MCP counts against the user's monthly quota (not a shared pool).

---

#### TASK-026: AI Watchdog (auto-detect brand changes)
**Priority:** P2 (Retention)
**Owner:** AI + Backend
**Effort:** 1 week
**Files:** new `convex/watchdog/`, cron action, dashboard

**Description:** When a user links a site to their account, a daily Convex cron checks the site for brand changes (logo, primary color). If a change is detected, send an in-app + email notification: "We noticed your site changed. Want us to regenerate your OG images?"

**Acceptance Criteria:**
- [ ] New `watchedSites` table: `{ userId, url, brandKitId, lastCheckedAt, lastBrandHash, notifyOnChange }`.
- [ ] Cron action runs daily (Convex `crons.interval`), checks each watched site, calls the vision LLM on a fresh screenshot, computes a brand hash (logo URL + primary color + font), and compares.
- [ ] On change, inserts a notification row and optionally sends an email via Resend.
- [ ] Dashboard "Notifications" panel shows unread notifications.
- [ ] User can pause watchdog per site.
- [ ] Cost: ~$0.01 per check × 1k watched sites × daily = $10/day. Acceptable for v1.

---

#### TASK-027: AI Performance Oracle (data network effects)
**Priority:** P0 (Tier 3 moat)
**Owner:** AI + Data
**Effort:** 3 weeks (depends on TASK-014 MCP + TASK-010 multi-platform + user base)
**Files:** new `convex/analytics/`, ML pipeline (offline), dashboard

**Description:** Collect CTR and engagement data per rendered image (via Twitter/LinkedIn pixel proxies or user-reported). Train a model: given `(url, brand, template)`, predict expected CTR. Surface as a "Recommended template" suggestion in the dashboard.

**Acceptance Criteria:**
- [ ] New `imageEngagement` table: `{ userId, renderId, platform, impressions, clicks, recordedAt }`.
- [ ] Collection mechanism: optional `?track=true` param enables a tracking pixel that fires when the image is loaded (e.g., in social previews). Initially via a redirect through OGSnap CDN.
- [ ] Offline ML pipeline: weekly job computes per-template CTR averages, per-color CTR deltas, per-font CTR deltas.
- [ ] API: `POST /v1/recommend` accepts `{ url, brand }` and returns `{ recommendedTemplate, expectedCtr, alternatives }`.
- [ ] Dashboard "Insights" tab: "Your 'editorial' template gets 2.3× more clicks than 'bold' for blog posts. Try it."
- [ ] This is the actual data network effect moat from the PRD.

---

#### TASK-028: Refactor to single Convex client everywhere
**Priority:** P3 (Code hygiene)
**Owner:** Frontend + Backend
**Effort:** 1 day
**Files:** `apps/web/src/lib/user-sync.ts`, `apps/web/src/lib/convex.ts`, `apps/web/src/app/api/onboarding/magic/route.ts`, `apps/web/src/app/api/billing/...`

**Description:** Today the web app calls Convex via four different mechanisms. Collapse to one typed Convex client everywhere (server-side `ConvexHttpClient` for server actions, `ConvexProviderWithClerk` for client components).

**Acceptance Criteria:**
- [ ] No `fetch(${NEXT_PUBLIC_CONVEX_URL}/v1/...)` in any web app file.
- [ ] Server actions use `ConvexHttpClient` (no Clerk auth needed on server) to call mutations/queries directly.
- [ ] Client components use `useQuery` / `useMutation` from `convex/react`.
- [ ] HTTP routes in `apps/web/src/app/api/` are deleted or reduced to one: `/v1/brand/upload-logo` (which needs `Request` body, not a Convex action).
- [ ] `INTERNAL_SERVICE_SECRET` is no longer used in the web app (it was a workaround for `fetch` from server).
- [ ] `pnpm typecheck` passes.

---

#### TASK-029: Add Remix SDK
**Priority:** P2 (Framework parity)
**Owner:** SDK
**Effort:** 2 days
**Files:** new `packages/remix/`, home page

**Description:** Mirror `astro` and `next` SDKs for Remix.

**Acceptance Criteria:**
- [ ] New package `packages/remix/` exporting `OGEndpoint({ apiKey, baseUrl?, defaultTemplate? })`.
- [ ] README with Remix integration example.
- [ ] `pnpm-workspace.yaml` includes the new package.
- [ ] Home page updated to list Remix as supported.

---

#### TASK-030: TanStack Start SDK
**Priority:** P3 (Framework parity)
**Owner:** SDK
**Effort:** 2 days
**Files:** new `packages/tanstack/`

**Description:** Mirror `astro`/`next` SDKs for TanStack Start.

**Acceptance Criteria:**
- [ ] New package `packages/tanstack/`.
- [ ] SDK exports `createOGHandler({ apiKey, baseUrl?, defaultTemplate? })` returning a TanStack Start-compatible request handler.
- [ ] README with example.
- [ ] `pnpm-workspace.yaml` includes the new package.
- [ ] Home page updated to list TanStack Start as supported.

---

#### TASK-031: Pricing page A/B test infrastructure
**Priority:** P2 (CMO optimization)
**Owner:** Frontend + Marketing
**Effort:** 1 week
**Files:** new `apps/web/src/lib/experiments.ts`, home page, pricing component

**Description:** Add a lightweight A/B test framework so the marketing page can experiment with pricing copy, CTA placement, and hero copy. Use a simple cookie-based bucket assignment (50/50 split for v1).

**Acceptance Criteria:**
- [ ] `apps/web/src/lib/experiments.ts` exports `getBucket(userId, experimentId): "A" | "B"`.
- [ ] Home page pricing card uses `getBucket` to choose between two pricing layouts (e.g., $7 vs $9 hero price).
- [ ] Variant assignment is sticky (cookie-based).
- [ ] Analytics: a `POST /v1/track/experiment` endpoint logs variant exposures. Dashboard shows exposure counts.
- [ ] No client-side flickering on first paint (variant resolved server-side).
- [ ] Documentation in `docs/26-GTM-STRATEGY-TRACTION-CHANNELS.md` updated with experiment results.

---

## 11. Sprint Mapping Summary

### Sprint 0 (Week 1) — Critical Fixes
- TASK-001 (security)
- TASK-002 (wow)
- TASK-003 (wow)
- TASK-004 (reliability)
- TASK-005 (perf + UX)
- TASK-006 (trust)
- TASK-007 (trust)
- TASK-008 (trust)
- TASK-021 (safety, small)

### Sprint 1 (Week 2-3) — Cost Economics & Multi-Platform
- TASK-009 (cost)
- TASK-010 (wow)
- TASK-011 (delight)
- TASK-012 (SEO)
- TASK-022 (test coverage)

### Sprint 2 (Week 4-5) — Schema Split, MCP, AI Polish
- TASK-013 (perf + data)
- TASK-014 (defensibility)
- TASK-015 (trust, framework parity)
- TASK-016 (wow)

### Sprint 3 (Week 6-7) — Templates, Webhooks, Hardening
- TASK-017 (PRD delivery)
- TASK-018 (code hygiene)
- TASK-019 (quality)
- TASK-023 (UX)

### Sprint 4 (Week 8+) — Performance & Polish
- TASK-020 (perf)
- TASK-024 (Tier 2 AI)
- TASK-025 (enterprise)
- TASK-026 (retention)
- TASK-027 (Tier 3 moat)
- TASK-028 (code hygiene)
- TASK-029, TASK-030 (framework parity)
- TASK-031 (CMO optimization)

---

## 12. Out-of-Scope / Backlog

These are mentioned for completeness but not prioritized in the immediate roadmap:

- **White-label / custom domain** — enterprise tier feature
- **Team seats** — needs at least 20 paying individual customers first
- **OpenAPI / SDK reference site** — generate from TS types via `ts-rest` or `tsoa`
- **Discord / community** — manual until PMF
- **Stripe migration** — DodoPayments is fine for v1, re-evaluate at $10K MRR
- **Mobile SDKs** — explicitly out of scope per PRD
- **Video / GIF generation** — not in PRD v1
- **Multi-language support** — explicitly out of scope
- **Per-tenant analytics dashboards** — depends on team seats

---

*Document Date: 2026-06-09*
*Next review: end of Sprint 0*
