# OGSnap launch runbook

Goal: from "code complete" to the first real $9 charge. Written 2026-10-07 from the repo state at `main` (`3364c59`).
Items marked **[you]** need your accounts. **[me]** means I can do it in-session once you've given access. **[unverified]** means I read it in the code or docs but haven't run it against production.

Known values: Convex project `ogsnap`, team `bharath-code`.
- Prod: `fearless-gazelle-27` → API/HTTP actions `https://fearless-gazelle-27.convex.site`, client `https://fearless-gazelle-27.convex.cloud`
- Dev: `different-cobra-393`

Shell prefix for every Convex CLI call (machine default is Node 26, Convex needs 20/22/24):
```bash
export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
cd convex   # run the Convex CLI from here; it has convex.json
```
After any `convex dev --configure`, run `git status` and restore `convex/README.md` and `convex/tsconfig.json` if overwritten.

---

## 0. Decisions to make first (5 min)

| Decision | Default I'd use | Why it matters |
|---|---|---|
| Domain | `ogsnap.dev` (hard-coded in code, `robots.ts`, `/check` canonical, watermark text, SDK default `api.ogsnap.dev`) | **[you]** confirm you own it. If not, buy it or change those strings. |
| Web host | Vercel | Next.js app and the render route (no separate renderer host) |
| Dodo mode | Test mode first, live later | `DODO_ENVIRONMENT=live_mode` switches API base to `live.dodopayments.com`; anything else uses test |

## 1. Generate secrets locally (2 min) [you]

```bash
echo "INTERNAL_SERVICE_SECRET=$(openssl rand -hex 32)"
echo "RENDERER_INTERNAL_TOKEN=$(openssl rand -hex 32)"
```
Keep both in a password manager. The same `INTERNAL_SERVICE_SECRET` and the same `RENDERER_INTERNAL_TOKEN` go to **both Convex and the web app**.
Do **not** set `DEV_BOOTSTRAP_SECRET` in production. The bootstrap route returns 404 when `NODE_ENV=production` anyway (see step 9 for minting an API key).

## 2. Clerk (10 min) [you]

1. Create a Clerk application (production instance for launch; a development instance is fine for the first test).
2. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
3. Clerk dashboard → JWT templates → New → choose Convex. The template **must be named `convex`** (`convex/auth.config.ts` uses `applicationID: "convex"`).
4. Copy the template's **Issuer** URL. This is `CLERK_JWT_ISSUER_DOMAIN`.
5. Allowed redirect/origin URLs: your web domain.

## 3. Dodo Payments (15 min) [you]

1. Create the account, stay in **test mode** for now. Copy the API key → `DODO_API_KEY` (test keys only work against the test API base).
2. Create two **subscription** products:
   - "Site", $9 / month → product id is `DODO_SITE_PRODUCT_ID`
   - "Agency", $49 / month → product id is `DODO_AGENCY_PRODUCT_ID`
3. Webhook: Developers → Webhooks → add endpoint `https://fearless-gazelle-27.convex.site/webhooks/dodo`. Subscribe to at least `subscription.active`, `subscription.renewed`, `subscription.cancelled` (the only events the handler maps). Copy the signing secret → `DODO_WEBHOOK_SECRET`.
4. Gap to know about: failed or expired subscriptions (`subscription.failed`, `subscription.expired`, `payment.failed` and similar) are **not mapped**. A card that stops working won't downgrade the site until Dodo sends `cancelled`. Acceptable for the first 10 customers; check the Dodo dashboard weekly. [unverified against Dodo's event list]
5. The customer portal uses `/customers/{id}/customer-portal/session`; test it after the first purchase.

## 4. Firecrawl, R2 (10 min) [you]

- `FIRECRAWL_API_KEY` from firecrawl.dev. Brand extraction uses its `branding` format.
- R2: bucket for renders, API token with Object Read & Write. You already have a marketing bucket `ogsnap-marketing`; **create a separate bucket** (the example env uses `ogsnap-renders`) and enable a public URL or custom domain. Values: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`, optional `R2_PREFIX` (default `renders`).

## 5. Set Convex production env (5 min) [you or me]

```bash
cd convex
npx convex env set --prod INTERNAL_SERVICE_SECRET <secret>
npx convex env set --prod RENDERER_INTERNAL_TOKEN <token>
npx convex env set --prod RENDERER_SERVICE_URL https://<web domain>/api
npx convex env set --prod DODO_WEBHOOK_SECRET <whsec>
npx convex env set --prod FIRECRAWL_API_KEY <key>
npx convex env set --prod CLERK_JWT_ISSUER_DOMAIN <issuer url>
npx convex env set --prod WEB_BASE_URL https://<your web domain>
npx convex env set --prod OG_FALLBACK_IMAGE_URL https://<web domain>/og-fallback.png   # optional; this is the default
npx convex env list --prod
```
`OPENAI_API_KEY` / `ANTHROPIC_API_KEY` are optional. They only feed alt-text and social copy; without them that step returns null.
**Order matters:** `CLERK_JWT_ISSUER_DOMAIN` must be set before the deploy in step 7, because `auth.config.ts` reads it at push time.

## 6. Rendering (no separate host) [done in code]

Rendering now runs inside the web app: `POST /api/render` (Satori + resvg, Node runtime, 30 s max). It needs `RENDERER_INTERNAL_TOKEN` and all `R2_*` on the **web** project (step 8) and `RENDERER_SERVICE_URL=https://<web domain>/api` on Convex (step 5; Convex calls `${RENDERER_SERVICE_URL}/render`).
Checks after the web deploy:
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<web domain>/api/render -H 'content-type: application/json' -d '{"html":"<div style=\"display:flex\">x</div>"}'   # 401
curl -s -X POST https://<web domain>/api/render -H "authorization: Bearer $RENDERER_INTERNAL_TOKEN" -H 'content-type: application/json' -d '{"html":"<div style=\"display:flex;font-size:60px\">hello</div>"}'   # {"imageUrl":"https://<r2 public>/renders/..."}
```
Why no Chromium host: the old renderer's Satori path never worked (dead font URL, template invalid for Satori), so everything had fallen back to Chromium. `apps/renderer` is kept for a Chromium option later; it is no longer part of `preflight`.

## 7. Deploy Convex to production (5 min)

```bash
cd convex
npx convex deploy          # prod (fearless-gazelle-27)
cd .. && pnpm convex:codegen:check
```
Verify the 8 internal functions still reject external calls (they did on the dev deployment). Run the Dodo webhook test event: `/webhooks/dodo` should return 401 for an unsigned request, not 500. A 500 means `DODO_WEBHOOK_SECRET` isn't set.

## 8. Deploy the web app (15 min) [you]

Vercel → import the repo → Root Directory `apps/web` (pnpm monorepo; `@ogsnap/core` is a workspace package, so keep "include files outside root directory" enabled). Production env:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `https://fearless-gazelle-27.convex.cloud` |
| `API_BASE_URL` | `https://fearless-gazelle-27.convex.site` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | from step 2 |
| `INTERNAL_SERVICE_SECRET` | same as Convex |
| `RENDERER_INTERNAL_TOKEN` | same as Convex (authorizes `/api/render`; required, the route refuses everything without it) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL` (+ optional `R2_PREFIX`) | from step 4 |
| `DODO_API_KEY`, `DODO_SITE_PRODUCT_ID`, `DODO_AGENCY_PRODUCT_ID` | from step 3 |
| `DODO_ENVIRONMENT` | unset (test) until step 11 |
| `WEB_BASE_URL`, `NEXT_PUBLIC_SITE_URL` | your https domain |
| `NEXT_PUBLIC_OG_BASE_URL` | optional; defaults to the `.convex.site` URL (the snippet customers paste points here, so decide the final domain **before** the first customer installs) |
| `OGSNAP_DEMO_KEY` | optional; only for `/api/demo-render` |

Point your domain at it, then run the local gate with the same values exported:
```bash
pnpm preflight:prod        # exits 0 when every required variable is present
```

## 9. Mint a smoke-test API key (5 min) [me]

`/v1/dev/bootstrap` is disabled in production. Call the internal functions with the admin CLI instead. [unverified: argument names are from `convex/dev/http.ts`]
```bash
cd convex
npx convex run --prod users/mutations:upsertFromIdentity '{"clerkId":"smoke_user","email":"you@yourdomain","fullName":"Smoke"}'
npx convex run --prod render/mutations:seedDefaultSubscriptionIfMissing '{"userId":"<id from above>"}'
npx convex run --prod apiKeys/mutations:createForUser '{"userId":"<id>","name":"smoke"}'
```
Save the returned `rawKey` as `OGSNAP_SMOKE_API_KEY` (GitHub Actions secret, and locally).

## 10. Smoke tests (10 min)

```bash
API_BASE_URL=https://fearless-gazelle-27.convex.site \
OGSNAP_SMOKE_API_KEY=<key> INTERNAL_SERVICE_SECRET=<secret> \
SMOKE_ONBOARDING_URL=https://example.com pnpm smoke:deploy
```
Or run the `deploy-smoke` workflow from the Actions tab after adding these as repo secrets: `API_BASE_URL`, `OGSNAP_SMOKE_API_KEY`, `INTERNAL_SERVICE_SECRET`, `OGSNAP_SMOKE_CLERK_ID`, `OGSNAP_SMOKE_EMAIL`, `SMOKE_RENDER_URL`, `SMOKE_ONBOARDING_URL`, `SMOKE_CONVEX_BASE_URL`.
Passing means render, internal sync-user and magic onboarding all work against production. This closes T1's 10-URL brand test once you also run it by hand on 10 real URLs.

## 11. End-to-end money test (20 min) [you + me]

1. Sign up on the live site, add a site, copy the snippet from `/dashboard/sites`.
2. "Keep it live": complete a **test-mode** checkout with Dodo's test card. Expect: webhook 200, site status flips to `active`, next image has no watermark. Replay the webhook from the Dodo dashboard: nothing changes (idempotent).
3. Buy Agency in test mode and add 10 sites. The 11th must be refused.
4. Click "Manage billing"; the Dodo portal should open.
5. Go live: set `DODO_ENVIRONMENT=live_mode`, **swap to live API key, live product ids and the live webhook secret** (test and live are separate Dodo environments with separate keys, products and webhooks; create the live webhook endpoint too). Redeploy web and set the live `DODO_WEBHOOK_SECRET` on Convex.
6. Buy "Site" once with your own card, confirm the full flow, then refund it in Dodo.

## 12. Real-platform test (T12) (20 min) [you + me]

1. Fresh Lovable project. In `/dashboard/sites` click "Copy Lovable prompt" and paste it into Lovable chat. Publish.
2. Check the live URL in opengraph.xyz, LinkedIn Post Inspector, X, Slack. Fresh URL each time; crawlers cache.
3. Record go or no-go in `tasks/todo.md` (1–3 lines). Note whether Lovable's own generated social image fights the snippet. Batch 1 showed Lovable now injects one by itself.

## 13. Edge worker for per-page previews (T10) (15 min) [you]

```bash
cd packages/edge-worker
npx wrangler kv namespace create OGSNAP_CACHE      # paste id into wrangler.toml
# set CONVEX_URL=https://fearless-gazelle-27.convex.site, and per customer SITE_ID (+ ORIGIN if not on your own zone)
npx wrangler deploy
```
The README records ~5 ms measured overhead on a local origin, so the p50 under 50 ms check passes on that measurement. Note the older `wrangler kv:namespace` spelling in the README is the legacy form. Test: 3 routes, 3 distinct images in opengraph.xyz, CSS/JS byte-identical.

## 14. Launch checklist before the first DM

- [ ] `pnpm preflight:prod` passes with production values
- [ ] Smoke test green
- [ ] Test-mode purchase flips status, replay is a no-op
- [ ] One live $9 charge made and refunded
- [ ] Lovable fresh-project test recorded
- [ ] `/check` loads and rate-limits; Lighthouse accessibility on the landing page ≥ 90
- [ ] Sentry or similar alerting: **not set up**. Minimum: a weekly look at Convex logs and the Dodo dashboard
- [ ] Privacy policy and terms pages: **none exist in the repo** (`apps/web/src/app` has no such routes). payment providers usually require them for live-mode approval (check Dodo's requirements); add before taking live money
- [ ] Support contact: an email address on the site and in the Dodo account

## 15. Rollback

- Web: Vercel → Deployments → promote the previous deployment.
- Convex: `git revert` and `npx convex deploy` (schema changes are the risky part; none are planned).
- Billing: switch `DODO_ENVIRONMENT` back to test and remove the live webhook endpoint if a live-money bug appears; refund in Dodo.
- Customers' previews never break: unknown or canceled sites fall back to `og-fallback.png` by design.

## Time estimate

About 2–3 hours of focused work if accounts exist; account setup is the long pole.
Everything here is **not yet executed**, so treat step times as estimates.
