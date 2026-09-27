# Tasks: 30-Day Pivot Validation

The plan and decisions are in `tasks/plan.md`. Size: XS = 1 file, S = 1–2 files, M = 3–5 files.
Standard checks for code tasks: `pnpm typecheck` and `pnpm build` pass.

---

## Phase 0: Hygiene (Day 1)

### T1: Use Firecrawl `branding` for brand extraction · S
Replace the vision-LLM and regex extraction with Firecrawl's branding format.
- [ ] `convex/brand/actions.ts` requests the `branding` format. Check the Firecrawl docs for whether this needs v2 `/v2/scrape`. The response maps to the existing `brandKits` fields: logo, primary/accent colors, font
- [ ] `convex/lib/llm.ts` and the regex helpers (`extractLogoUrl`, `extractHexColor`, `extractPrimaryColor`) are deleted. No `claude-3-5-sonnet` string is left in the repo
- [ ] On 10 test URLs (3 Lovable, 3 Framer, 2 Webflow, 2 SaaS sites), `POST /v1/onboarding/magic` returns a loadable logo for ≥8 and a non-default primary color for ≥8
- [ ] If Firecrawl fails, the endpoint returns `success:false` with a message. It never returns a made-up `/logo.png`

**Verify:** typecheck; run the 10 URLs manually and record results in the PR description.
**Deps:** none. **Files:** `convex/brand/actions.ts`, `convex/lib/llm.ts` (delete).

### T2: Make the landing page honest · XS
- [ ] Remove Remix and TanStack Start from `apps/web/src/app/page.tsx` (lines around 43, 51, 85, 197, 447)
- [ ] Home page prices match the checkout prices, from one shared constant
**Verify:** `grep -rn "TanStack\|Remix" apps/web/src` returns nothing; manual check of the pricing section against checkout.
**Deps:** none. **Files:** `apps/web/src/app/page.tsx`, `apps/web/src/lib/dodo.ts`.

### T3: Stop tracking `.env.mcp` · XS
- [ ] `git rm --cached .env.mcp`, and add `.env.mcp` to `.gitignore`
**Verify:** `git ls-files .env.mcp` prints nothing. **Deps:** none.

### ✅ Checkpoint 0
- [ ] `pnpm typecheck && pnpm build` pass
- [ ] Deployed; magic onboarding works on a live URL

---

## Phase 1: Validation assets and outreach (Days 2–7)

### T4: Preview audit script · S
Given a URL list, report each URL's social preview health.
- [ ] `scripts/audit-previews.ts` reads a file with one URL per line and writes CSV: `url, platform_guess, has_og_image, image_status, width, height, has_og_title, verdict`
- [ ] Detects the platform (Lovable, Framer, Webflow, other) from HTML or headers
- [ ] Verdict is one of `missing`, `broken` (non-200), `generic` (the same image as the homepage, or a platform default), `ok`
**Verify:** run on 5 known sites (1 per verdict, plus 1 Framer) and check each verdict by hand.
**Deps:** none. **Files:** `scripts/audit-previews.ts`.

### T5: Before/after image generator · S
- [ ] `scripts/before-after.ts <url>` calls the magic onboarding pipeline and writes a 1200×630 PNG: current preview on the left (or a "no preview" placeholder), OGSnap preview on the right
- [ ] Completes in under 20s per URL; one bad URL doesn't stop a batch
**Verify:** 30 PNGs produced from the T7 prospect list; spot-check 5 visually.
**Deps:** T1, T4. **Files:** `scripts/before-after.ts`.

### T6: Pivot landing page and lead capture · M
- [ ] The hero message is about sharing a site, not code, e.g. "Every page of your site looks great when shared. Install once." The primary CTA is a URL input, not "Start Free"
- [ ] Submitting a URL runs magic onboarding and shows the before/after result without signup. An email is required only to get the install snippet
- [ ] A new Convex table `leads {email, url, platform, createdAt, source}` stores each submission
- [ ] The page shows a real price: "$9/site/mo · Agencies $49/10 sites"
**Verify:** submit 3 URLs end to end; rows appear in the Convex dashboard; Lighthouse accessibility score ≥90.
**Deps:** T1, T2. **Files:** `apps/web/src/app/page.tsx`, `convex/schema.ts`, `convex/leads/mutations.ts`, `apps/web/src/components/onboarding/live-render-demo.tsx`.

### T7: Outreach batch 1 (not code) · —
- [ ] 30 prospects found (Lovable Launched, Framer community showcase, X "built with Lovable" posts) and run through T4. Only `missing`, `broken` or `generic` sites qualify
- [ ] 30 DMs or emails sent, max 10/day, each with that site's before/after image and one question: "Want this live on your site?"
- [ ] Results tracked in a sheet: sent, replied, interested, paid
**Exit signal:** ≥10 replies → Phase 2. Fewer than 10 → rewrite the message or switch segment and send batch 2.
**Deps:** T4, T5, T6.

### ✅ Checkpoint 1 (Day 7)
- [ ] Reply count recorded; continue/adjust decision written in one line at the bottom of this file

---

## Phase 2: Concierge delivery and payment (Days 8–14)

### T8: Stable site-wide image endpoint · M
- [ ] New `sites {userId, domain, brandKitId, status: trial|active|canceled, createdAt}` table
- [ ] `GET /v1/site/{siteId}/og.png` returns the rendered branded image (302 to R2 or streamed), cached. The response is well under 2s so it doesn't hit crawler timeouts
- [ ] Unknown or canceled `siteId` → falls back to a neutral image, never an error (so a customer's preview never breaks)
- [ ] The dashboard shows the copy-paste snippet: `og:image` and `twitter:image` pointing at that URL
**Verify:** paste the snippet into a real Lovable project; the opengraph.xyz and LinkedIn Post Inspector previews show the branded image.
**Deps:** T6. **Files:** `convex/schema.ts`, `convex/sites/*.ts`, `convex/http.ts`, `apps/web/src/app/dashboard/page.tsx`.

### T9: Per-site billing · S
- [ ] A Dodo product "Site – $9/mo". The checkout link carries `siteId`
- [ ] The webhook sets `sites.status = active` (idempotent, reusing the existing `webhookEvents` dedupe)
- [ ] `trial` sites render with the existing watermark; `active` sites render without it
**Verify:** a test-mode purchase flips status and the next image is un-watermarked; replaying the same webhook causes no double change.
**Deps:** T8. **Files:** `convex/billing/mutations.ts`, `convex/billing/webhooks.ts`, `apps/web/src/app/api/billing/create-checkout/route.ts`.

### T9b: Concierge installs (not code) · —
- [ ] Every interested reply from T7 gets a set-up site and snippet within 24h, installed by you if they give access
**Exit signal:** ≥3 paid (real money, not test mode).
**Deps:** T8, T9.

### ✅ Checkpoint 2 (Day 14)
- [ ] ≥3 paying → continue. 0 paying → apply the plan's early gate
- [ ] Log why each non-payer declined (one line each)

---

## Phase 3: Per-page and channel (Days 15–21)

### T10: Per-page previews via Worker proxy · M
- [x] `packages/edge-worker` gains a proxy mode. For HTML responses, HTMLRewriter replaces or inserts `og:image` and `twitter:image` with `/v1/site/{siteId}/og.png?path={pathname}`. Non-HTML passes through unchanged
- [x] The title per path comes from the page's `<title>` or `og:title`
- [x] Added overhead on HTML requests: p50 <50ms (measured with `wrangler dev` plus 20 requests)
**Verify:** 3 routes on a test site return 3 distinct images in opengraph.xyz; images, JS and CSS are byte-identical through the proxy.
**Deps:** T8. **Files:** `packages/edge-worker/index.ts`, `packages/edge-worker/wrangler.toml`, `packages/edge-worker/README.md`.

### T11: Public preview checker page · S
- [x] `/check` page: paste a URL → shows how it looks on X, LinkedIn and Slack, plus the T4 verdict, plus a CTA to "fix it"
- [x] Reuses the T4 logic, moved into a shared module; no duplication
- [x] Rate-limited per IP
**Verify:** 5 URLs give the same verdicts as the T4 CLI.
**Deps:** T4. **Files:** `apps/web/src/app/check/page.tsx`, `apps/web/src/app/api/check/route.ts`, the shared module.

### T12: Channel spike, 2-day time-box · S
Pick the channel with more T7 replies.
- [ ] **Framer:** a proof-of-concept plugin sets the site's social image to the T8 URL. Document what the plugin API can and cannot set per page
- [ ] **or Lovable:** a one-paste prompt plus a doc ("Paste this into Lovable chat") that installs the snippet. Test it on a fresh Lovable project
  - 2026-09-27: channel = Lovable (picked before T7 data). Prompt ships as "Copy Lovable prompt" on /dashboard/sites; fresh-project test pending
- [ ] Write a go/no-go note of 1–3 lines
**Deps:** T7 data, T8.

### ✅ Checkpoint 3 (Day 21)
- [ ] ≥50 checker runs this week, ≥1 per-page install live, paying count updated

---

## Phase 4: Agencies and MCP (Days 22–30)

### T13: Agency plan (multiple sites) · S
- [ ] A user can own N sites. The agency plan ($49/mo) allows 10 active sites, enforced when creating a site
- [ ] The dashboard lists sites with status and snippet
**Verify:** creating an 11th site on the agency plan is refused with an upgrade message.
**Deps:** T9. **Files:** `convex/sites/mutations.ts`, `convex/billing/mutations.ts`, dashboard page.

### T14: MCP server · S
- [ ] Tools: `extract_brand(url)`, `render_preview(url, title?)`, `check_preview(url)`, wrapping the existing HTTP endpoints with API-key auth
- [ ] Works from Claude Code and Cursor (tested by hand)
- [ ] Submitted to 2 MCP directories
**Deps:** T1, T4, T8. **Files:** `packages/mcp/*` (new, minimal).

### T15: Agency outreach (not code) · —
- [ ] 15 agencies contacted (Framer/Webflow expert directories), ≥5 calls held
**Exit signal:** ≥1 agency paying.

### 🚦 Day 30 gate
- [ ] Count paying customers (sites and agencies)
- [ ] **≥5:** write the v1 plan (weekly broken-preview email, analytics, pricing test)
- [ ] **<5:** open-source the renderer and brand pipeline, archive the repo, write a 5-line retro

---

## Decision log
<!-- one line per checkpoint -->
