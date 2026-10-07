# Tasks: 30-Day Pivot Validation

The plan and decisions are in `tasks/plan.md`. Size: XS = 1 file, S = 1–2 files, M = 3–5 files.
Standard checks for code tasks: `pnpm typecheck` and `pnpm build` pass.

---

## Phase 0: Hygiene (Day 1)

### T1: Use Firecrawl `branding` for brand extraction · S
Replace the vision-LLM and regex extraction with Firecrawl's branding format.
- [x] `convex/brand/actions.ts` requests the `branding` format. Check the Firecrawl docs for whether this needs v2 `/v2/scrape`. The response maps to the existing `brandKits` fields: logo, primary/accent colors, font
- [x] `convex/lib/llm.ts` and the regex helpers (`extractLogoUrl`, `extractHexColor`, `extractPrimaryColor`) are deleted. No `claude-3-5-sonnet` string is left in the repo
- [ ] On 10 test URLs (3 Lovable, 3 Framer, 2 Webflow, 2 SaaS sites), `POST /v1/onboarding/magic` returns a loadable logo for ≥8 and a non-default primary color for ≥8
- [x] If Firecrawl fails, the endpoint returns `success:false` with a message. It never returns a made-up `/logo.png`

  - blocked: needs `FIRECRAWL_API_KEY`

**Verify:** typecheck; run the 10 URLs manually and record results in the PR description.
**Deps:** none. **Files:** `convex/brand/actions.ts`, `convex/lib/llm.ts` (delete).

### T2: Make the landing page honest · XS
- [x] Remove Remix and TanStack Start from `apps/web/src/app/page.tsx` (lines around 43, 51, 85, 197, 447)
- [x] Home page prices match the checkout prices, from one shared constant
**Verify:** `grep -rn "TanStack\|Remix" apps/web/src` returns nothing; manual check of the pricing section against checkout.
**Deps:** none. **Files:** `apps/web/src/app/page.tsx`, `apps/web/src/lib/dodo.ts`.

### T3: Stop tracking `.env.mcp` · XS
- [x] `git rm --cached .env.mcp`, and add `.env.mcp` to `.gitignore`
**Verify:** `git ls-files .env.mcp` prints nothing. **Deps:** none.

### ✅ Checkpoint 0
- [ ] `pnpm typecheck && pnpm build` pass
- [ ] Deployed; magic onboarding works on a live URL

---

## Phase 1: Validation assets and outreach (Days 2–7)

### T4: Preview audit script · S
Given a URL list, report each URL's social preview health.
- [x] `scripts/audit-previews.ts` reads a file with one URL per line and writes CSV: `url, platform_guess, has_og_image, image_status, width, height, has_og_title, verdict`
- [x] Detects the platform (Lovable, Framer, Webflow, other) from HTML or headers
- [x] Verdict is one of `missing`, `broken` (non-200), `generic` (the same image as the homepage, or a platform default), `ok`
**Verify:** run on 5 known sites (1 per verdict, plus 1 Framer) and check each verdict by hand.
**Deps:** none. **Files:** `scripts/audit-previews.ts`.

### T5: Before/after image generator · S
- [x] `scripts/before-after.ts <url>` calls the magic onboarding pipeline and writes a 1200×630 PNG: current preview on the left (or a "no preview" placeholder), OGSnap preview on the right
- [x] Completes in under 20s per URL; one bad URL doesn't stop a batch
**Verify:** 30 PNGs produced from the T7 prospect list; spot-check 5 visually.
**Deps:** T1, T4. **Files:** `scripts/before-after.ts`.

### T6: Pivot landing page and lead capture · M
- [x] The hero message is about sharing a site, not code, e.g. "Every page of your site looks great when shared. Install once." The primary CTA is a URL input, not "Start Free"
- [x] Submitting a URL runs magic onboarding and shows the before/after result without signup. An email is required only to get the install snippet
- [x] A new Convex table `leads {email, url, platform, createdAt, source}` stores each submission
- [x] The page shows a real price: "$9/site/mo · Agencies $49/10 sites"
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
- [x] New `sites {userId, domain, brandKitId, status: trial|active|canceled, createdAt}` table
- [x] `GET /v1/site/{siteId}/og.png` returns the rendered branded image (302 to R2 or streamed), cached. The response is well under 2s so it doesn't hit crawler timeouts
- [x] Unknown or canceled `siteId` → falls back to a neutral image, never an error (so a customer's preview never breaks)
- [x] The dashboard shows the copy-paste snippet: `og:image` and `twitter:image` pointing at that URL
  - code done; live check pending the T12 Lovable test

**Verify:** paste the snippet into a real Lovable project; the opengraph.xyz and LinkedIn Post Inspector previews show the branded image.
**Deps:** T6. **Files:** `convex/schema.ts`, `convex/sites/*.ts`, `convex/http.ts`, `apps/web/src/app/dashboard/page.tsx`.

### T9: Per-site billing · S
- [ ] A Dodo product "Site – $9/mo". The checkout link carries `siteId`
  - code done (checkout passes `siteId`); blocked: create the product in Dodo, set `DODO_SITE_PRODUCT_ID`, run a test-mode purchase
- [x] The webhook sets `sites.status = active` (idempotent, reusing the existing `webhookEvents` dedupe)
- [x] `trial` sites render with the existing watermark; `active` sites render without it
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
- [ ] Added overhead on HTML requests: p50 <50ms (measured with `wrangler dev` plus 20 requests)
  - blocked: `wrangler dev` measurement and deploy not run yet
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
- [x] A user can own N sites. The agency plan ($49/mo) allows 10 active sites, enforced when creating a site
- [x] The dashboard lists sites with status and snippet
  - 2026-09-27: code done; `node scripts/check-agency-sites.ts` passes. Pending: Dodo "Agency – $49/mo" product + `DODO_AGENCY_PRODUCT_ID`, then a live 11th-site check
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

## Phase L: Launch readiness (added 2026-10-07; blocks T7 sends, T9b and the day-30 count)

Details and commands are in `.claudedocs/launch-runbook.md`. Owner: **you** = needs your accounts, **me** = Claude Code in-session. "Verify" lines are the acceptance tests; a task is done only when every box is ticked with evidence (command output or screenshot noted in the box).
Sizes: XS under 30 min, S 30–90 min, M 2–4 h.

### L0: Decisions · XS · you
- [ ] Domain: confirm you own `ogsnap.dev` (hard-coded in `robots.ts`, `/check` canonical, watermark text, SDK default `api.ogsnap.dev`), or pick another and list the strings to change
- [ ] Hosts chosen: web (Vercel), renderer (Fly / Railway / VPS)
- [ ] Final image domain decided before any customer installs (`NEXT_PUBLIC_OG_BASE_URL`); snippets pasted by customers cannot be changed centrally later
**Verify:** `dig +short <domain>` resolves to your host; the three choices are written in the Decision log.
**Deps:** none.

### L1: Clerk with Convex JWT · S · you
- [ ] Clerk app created; publishable and secret keys stored
- [ ] JWT template named exactly `convex`; issuer URL stored as `CLERK_JWT_ISSUER_DOMAIN`
**Verify:** on a dev deployment, a signed-in browser session makes `/dashboard` load the user's data (the query sees a non-null identity); signed out, the same query is refused.
**Deps:** none.

### L2: Dodo products and webhook (test mode) · S · you
- [ ] Subscription products "Site" $9/mo and "Agency" $49/mo exist; ids stored as `DODO_SITE_PRODUCT_ID` and `DODO_AGENCY_PRODUCT_ID`
- [ ] Webhook endpoint `https://fearless-gazelle-27.convex.site/webhooks/dodo` subscribed to `subscription.active`, `.renewed`, `.cancelled`; signing secret stored
**Verify:** an unsigned `curl -X POST` to the endpoint returns 401 (not 500, which means the secret is missing); a Dodo "send test event" returns 200 and creates one `webhookEvents` row.
**Deps:** L5 for the secret to be set.

### L3: R2 bucket and Firecrawl key · S · you
- [ ] Separate render bucket (not `ogsnap-marketing`) with a public URL; token with object read/write
- [ ] `FIRECRAWL_API_KEY` stored
**Verify:** upload a test object with the token and fetch it via `R2_PUBLIC_BASE_URL` (HTTP 200). Closes T1's open check: `POST /v1/onboarding/magic` on 10 URLs (3 Lovable, 3 Framer, 2 Webflow, 2 SaaS) returns a loadable logo for ≥8 and a non-default primary colour for ≥8; results pasted into the PR.
**Deps:** none.

### L4: Render route in the web app (replaces the separate Chromium renderer) · M · me + you
Decided 2026-10-07: render with Satori + resvg inside `apps/web` (`POST /api/render`), no extra host. `apps/renderer` (Playwright) stays in the repo as the Chromium option if templates outgrow Satori's CSS subset.
- [x] `apps/web/src/app/api/render/route.ts`: bearer auth (token required, constant-time compare), zod validation, Satori → PNG → R2; retries once without images when a logo fails
- [x] Font embedded (Inter 400/700, OFL) instead of fetched: the old cdnjs font URL returned 404
- [x] Template rewritten with inline styles and flex (`convex/render/template.ts`); the old one was invalid for Satori, so every earlier "Satori" render had silently fallen back to Chromium
- [x] resvg system-font scan disabled: 2.2 s → 44 ms per render
- [x] Convex always requests `engine: "satori"`
- [ ] R2 vars and `RENDERER_INTERNAL_TOKEN` set in the Vercel project; Convex `RENDERER_SERVICE_URL` = `https://<web domain>/api`
**Verify (local, done):** no token → 401, bad body → 400, valid → 1200×630 PNG; real logo renders; dead logo URL still renders; 1080×1080 renders; 20 sequential renders, 0 failures, p50 69 ms.
**Verify (deployed, open):** the same 401/400/200 checks against the Vercel URL; the returned `imageUrl` loads from the R2 public URL; 20 sequential renders on Vercel with 0 failures and the p50 recorded here; compare 5 real sites' output by eye against the old look.
**Deps:** L3. **Files:** `apps/web/src/app/api/render/route.ts`, `apps/web/src/lib/render/*`.

### L5: Convex production env and deploy · S · you + me
- [ ] All of `INTERNAL_SERVICE_SECRET`, `RENDERER_INTERNAL_TOKEN`, `RENDERER_SERVICE_URL` (= `https://<web domain>/api`), `DODO_WEBHOOK_SECRET`, `FIRECRAWL_API_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, `WEB_BASE_URL` set with `npx convex env set --prod`; `DEV_BOOTSTRAP_SECRET` **not** set
- [ ] `npx convex deploy` succeeds; `pnpm convex:codegen:check` passes
**Verify:** `npx convex env list --prod` shows each name; the 8 internal functions reject unauthenticated external calls (curl returns 4xx); `/webhooks/dodo` unsigned returns 401.
**Deps:** L1, L2 (secret), L6 (the render URL is the web domain).

### L6: Web deployed · S · you
- [ ] Vercel project, root `apps/web`, production env as in the runbook table; domain attached
**Verify:** `pnpm preflight:prod` exits 0 with the production values; landing page loads over https; sign-up and sign-in work; `/check` returns a verdict for a public URL and returns 429 after the rate limit (T11: 21 requests); Lighthouse accessibility ≥90 on the live landing page.
**Deps:** L0, L1, L3, L4.

### L7: Production API key and smoke test · S · me
- [ ] Smoke user and key created with `npx convex run --prod` on the internal functions (`/v1/dev/bootstrap` is disabled in production)
- [ ] GitHub secrets set: `API_BASE_URL`, `OGSNAP_SMOKE_API_KEY`, `INTERNAL_SERVICE_SECRET` and the optional smoke ones
**Verify:** `pnpm smoke:deploy` exits 0; the `deploy-smoke` workflow is green in Actions.
**Deps:** L5, L6.

### L8: Billing end to end, test mode · M · you + me
- [ ] Site purchase: webhook 200, `sites.status` goes `trial` → `active`, next image has no watermark
- [ ] Replaying the same webhook changes nothing (one `webhookEvents` row, status unchanged)
- [ ] Agency purchase: a 10th site is accepted, an 11th refused with the upgrade message
- [ ] "Manage billing" opens the Dodo customer portal
- [ ] Cancel in the portal: `cancelled` webhook sets status `canceled`; the og.png then serves the fallback image, not an error
**Verify:** each box ticked with a screenshot or log line; closes T9 and T13 open checks.
**Deps:** L2, L6, L7.

### L9: Go live · S · you
- [ ] `DODO_ENVIRONMENT=live_mode`, live API key, live product ids, live webhook endpoint and secret (Dodo test and live are separate environments)
- [ ] One real $9 purchase with your own card completes the full flow, then is refunded in Dodo
**Verify:** webhook delivery shows 200 in the Dodo live dashboard; site flips to `active`; refund recorded.
**Deps:** L8, L12 (Dodo may require legal pages before approving live mode).

### L10: Lovable fresh-project test (T12) · S · you + me
- [ ] New Lovable project; "Copy Lovable prompt" pasted; published
- [ ] Preview correct in opengraph.xyz, LinkedIn Post Inspector, X card validator, Slack unfurl (fresh URL each time)
- [ ] Recorded: does Lovable's own generated social image conflict with the pasted tags? (Batch 1 found Lovable now injects one automatically.)
- [ ] go/no-go note of 1-3 lines in the Decision log
**Deps:** L8 (a trial site is enough; payment not required).

### L11: Edge worker deployed (T10 remainder) · S · you
- [ ] KV namespace created and its id in `wrangler.toml`; `CONVEX_URL` set to the production `.convex.site`; `npx wrangler deploy`
**Verify:** on a test site, 3 routes return 3 distinct images in opengraph.xyz; JS/CSS/images byte-identical through the proxy (`curl | shasum` compare); HTML overhead p50 <50 ms measured against the deployed worker (README reports ~5 ms against a local origin).
**Deps:** L8.

### L12: Compliance and operations minimum · M · me (code) + you (accounts)
- [ ] `/privacy` and `/terms` pages exist and are linked in the footer (me)
- [ ] Support email address shown on the site and set in Dodo (you)
- [ ] Billing webhook maps failed/expired/on-hold subscription events to a non-active status; event names confirmed against Dodo's current docs first; covered by a test (me)
- [ ] Error alerting: one channel notified on Convex function errors or a failing deploy-smoke (you pick the tool)
**Verify:** pages return 200 and are in the sitemap; the new webhook test passes; a deliberately failing smoke run triggers the alert.
**Deps:** L5. **Files:** `apps/web/src/app/{privacy,terms}/page.tsx`, `convex/billing/webhooks.ts`, test.

### ✅ Checkpoint L (launch ready)
- [ ] L0-L12 ticked with evidence; `pnpm typecheck && pnpm build` pass on `main`
- [ ] Only now: generate before/after images (T5 against production) and send the first DMs

### T7b: Outreach batch 2 execution (replaces the original T7 targeting) · not code · you
Batch 1 (34 showcase sites) found only 4 gaps, and Lovable now injects a social image itself; batch 2 (76 content-heavy sites) found 22 qualified of 65 reachable. Targets and templates: `.claudedocs/outreach/`.
- [ ] Owner contact (email or X handle) found for the top 10 in `tracker.csv` (about 20 min each)
- [ ] Before/after image per site made from one **inner page** (not the homepage)
- [ ] 10 DMs sent (template A or B), max 10 per day; replies logged in `tracker.csv` with a one-line reason for every "no"
**Exit signal:** ≥3 replies out of 10 → batch 3 of 30. 0-1 replies out of 10 → rewrite the message once. If still <10 replies per 30 DMs after the rewrite, trigger the gate early (see `plan.md`).
**Deps:** Checkpoint L.

## Decision log
<!-- one line per checkpoint -->
- 2026-10-07 Checkpoint 1 (adjusted): batch 1 audit of 34 showcase sites: 30 ok, 2 missing, 2 DNS errors. Lovable now generates a social image; the remaining gap is per-page (same image and title on every route). Decision: do not DM homepage-ok sites; target sites with many inner pages.
- 2026-10-07 batch 2: 76 content-heavy sites, 13 qualify (inner pages show the homepage preview), 9 have no image. Next: Phase L, then T7b.
