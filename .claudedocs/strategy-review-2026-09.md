# OGSnap Strategy Review: September 2026

Perspectives: CEO · PM · CTO · CFO · CMO. Research date: 2026-09-25.
Earlier reviews: `docs/28-PRODUCT-ENGINEERING-AUDIT-AND-ROADMAP.md` (June 2026) and `docs/validation-report.md` (July 2026).

## TL;DR

- **Verdict: pivot.** OG images still matter. Selling an OG image API to developers doesn't work as a business anymore.
- **Why:** since June, two of the three differentiators have become cheap or free commodities:
  1. *Render for any framework:* Satori gets about 2.7M downloads a week. Takumi (Rust, 2–10× faster) is now the default renderer in nuxt-og-image v6. AI coding agents write an OG route in about a minute.
  2. *Brand extraction from a URL:* Firecrawl ships a `branding` format (logo, colors, fonts from one call), and you already pay for Firecrawl. Brandfetch sells a Brand API. **Google Pomelli** does "paste URL → Business DNA → on-brand assets" for free.
- **Recommended pivot:** *Social-preview autopilot for sites built with no-code and vibe-coding tools* (Lovable, Framer, Webflow, Shopify, Ghost). These buyers are non-developers who can't run Satori, and there are a lot of them: Lovable alone gets about 200k new projects a day, and about 60% of its users aren't developers. Add an MCP server as a cheap second channel. Test it for 30 days with kill criteria.
- **Set your ceiling honestly.** The closest successful comparables are indie-sized: Bannerbear is at about $630K ARR after roughly 6 years, ScreenshotOne has plateaued at $32K MRR, and Orshot makes about $8K a month. The "$30M ARR" talk in `docs/25` doesn't match anything in this category. The $10M+ outcome in the space was AdCreative.ai (ad creative, $15.9M ARR, sold for $38.7M), and Pomelli is now attacking that segment for free.
- **The biggest problem is how you're working, not the code.** The repo has about 13.5k lines of docs, about 5k lines of code, 28 strategy docs, and no commits in 57 days. The July validation said "run a 2-week concierge test before writing more code or docs." Nothing in the repo shows that test ever ran. What you need most is conversations with customers, not more planning.

---

## 1. Is OG still relevant? (market reality)

| Signal | Data | Read |
|---|---|---|
| OG images still move clicks | Industry write-ups report +20–50% CTR after fixing missing or poor previews ([opengraph.xyz](https://www.opengraph.xyz/blog/the-ultimate-guide-to-open-graph-images), [buddyboss](https://buddyboss.com/blog/open-graph-image-for-community-platforms/)) | The problem is real, but these figures are vendor-sourced and directional, not rigorous |
| Developers get it free | `satori` had 2,693,148 downloads in the week of Sep 15–21, 2026 ([npm API](https://api.npmjs.org/downloads/point/last-week/satori)) | The developer segment is saturated |
| Free tools are getting faster | Takumi: Rust, no browser, 2–10× faster than Satori, default in nuxt-og-image v6 ([takumi](https://takumi.kane.tw/), [nuxtseo](https://nuxtseo.com/docs/og-image/renderers/takumi)) | Free options keep improving |
| Brand extraction is a commodity | Firecrawl Branding Format v2 ([blog](https://www.firecrawl.dev/blog/branding-format-v2)); Brandfetch Brand API at $99/mo ([pricing](https://brandfetch.com/developers/pricing)) | Your "wow" feature can be bought with one API call |
| Free big-tech competitor | Google Pomelli: URL → Business DNA → campaign assets, free ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/pomelli/)) | Kills "magic onboarding" as a paid SMB product |
| AI search | Citations show source cards and use og:title ([geodocs](https://geodocs.dev/reference/ai-citation-format-spec-by-engine)) | OG metadata matters for AEO, but mostly the title and description, not the image |

**Conclusion:** the problem is still relevant, but the product as currently positioned isn't.

## 2. Competitive landscape

| Player | Price | Scale / traction | Buyer | Threat to you |
|---|---|---|---|---|
| Satori / @vercel/og | Free | 2.7M downloads/week | Developers | Fatal in the developer segment |
| Takumi / nuxt-og-image | Free | Nuxt default | Developers | High |
| Bannerbear | $49 / $149 / $299 per mo ([sudomock](https://sudomock.com/blog/bannerbear-api-pricing-2026)) | ~$630K ARR ([superframeworks](https://superframeworks.com/blog/bannerbear)) | Marketers, no-code | Incumbent; shows the category's ceiling |
| Placid | $19 (500 credits), $39 (2.5k) ([pricing](https://placid.app/pricing)) | Has an MCP server | Marketers | Already occupies the MCP angle |
| Orshot | $39 → $349/mo, under $0.005/img at scale ([pricing](https://orshot.com/pricing)) | ~$8K/30d ([TrustMRR](https://trustmrr.com/startup/orshot-com)) | API buyers | Price floor |
| Imejis | $14.99/1k, $24.99/10k ([comparison](https://www.imejis.io/blogs/comparisons/image-generation-api-pricing-comparison)) | n/a | API buyers | Price floor |
| ScreenshotOne | $17–259/mo | $32K MRR, plateaued ([case study](https://superframeworks.com/case-study/screenshotone)) | Developers | Adjacent; shows the ceiling for a solo developer API |
| Firecrawl branding | Usage-based | Big developer base | Developers, agents | Commoditizes brand extraction |
| Google Pomelli | Free | Google distribution | SMBs | Commoditizes URL → branded assets |
| Canva Connect Autofill | Enterprise-gated ([docs](https://www.canva.dev/docs/connect/autofill-guide/)) | Huge | Enterprise | Long-term risk at the top of the market |
| **OGSnap today** | $0 / $7 (landing) vs $9 (checkout) | 0 known paying users | JS developers | None of these threats is solved |

**Positioning gap still open:** automatic, per-page social previews for sites whose owners can't write code, with no work after install. Bannerbear and Placid make you design templates and wire up Zapier. Pomelli makes campaign posts, not per-URL og:image tags. Lovable only offers a manual "upload share image" field ([Lovable docs](https://docs.lovable.dev/features/publish)). Third-party guides titled "Social sharing preview broken in Lovable" exist ([humansfix](https://humansfix.ai/guides/lovable/social-sharing-preview-broken), [cathedral.design](https://www.cathedral.design/thoughts/lovable-cloudflare-workers)), which suggests real demand.

## 3. Five-lens review

### CEO
- Stop optimizing for a developer audience that already has a free answer.
- Pick a goal. **(a) Indie cash flow** of $5–30K MRR is plausible based on the comparables. **(b) VC-scale** is not plausible with OG as the core. If (b) is the goal, OG becomes a feature inside something bigger, like brand-consistent content for AI agents, and the competition there is Pomelli, Canva, and Adobe.
- Go through the full docs set. Archive `docs/10-VC-DUE-DILIGENCE`, `11-MOAT`, and `25-ECONOMIC-PROJECTION-EXIT`. They describe a company that doesn't exist yet and make it look further along than it is.

### PM
- **Job to be done (pivot):** "When I share my Lovable/Framer site, I want every page to show a good-looking preview without designing anything."
- **MVP scope:** install (a script tag, an edge proxy, or a platform plugin) → crawl the sitemap → one branded image per page → meta tags injected → weekly "broken preview" email.
- **Cut:** Svelte/Astro/Next SDK marketing, template marketplace, team seats, analytics dashboard.
- **Keep:** renderer, brand kit, cache, R2, `packages/edge-worker` (your fastest route to meta injection on sites you don't control through DNS/proxy).

### CTO: code state, verified today
| # | Finding | Evidence | Fix |
|---|---|---|---|
| 1 | **Anthropic vision path calls a retired model.** It returns null, then silently falls back to the regex scraper | `convex/lib/llm.ts:119`, `:249`: `claude-3-5-sonnet-20241022` (retired Oct 2025) | Delete most of `llm.ts` and the regex block in `convex/brand/actions.ts`. Ask Firecrawl for `formats: ["branding"]`, since you already make that call. About 300 fewer lines |
| 2 | False claims in marketing | `apps/web/src/app/page.tsx:43,85,197,447` claims Remix and TanStack Start, which aren't shipped | Remove them; after the pivot the framework list doesn't matter |
| 3 | Price mismatch | `page.tsx:163` shows $7; the checkout plans differ | One price table, shared by the page and checkout |
| 4 | `.env.mcp` is tracked in git (currently empty) | `git ls-files .env.mcp` | `git rm --cached .env.mcp` before someone adds a key |
| ✅ | June audit fixes landed | SHA-256 cache key; `identity.subject` check in dashboard queries; Satori for the free tier | Keep them |
- **Vendor count:** Convex, Clerk, Dodo, Firecrawl, R2, a Playwright host, and Cloudflare Workers. That's 7 vendors with 0 customers. Don't rewrite before validation. After it: Worker + Takumi/Satori + R2 + KV could handle most renders.

### CFO
- **COGS aren't the problem.** Satori on the free tier costs close to nothing. Self-hosted Chromium at low volume costs well under $0.001/img (estimate: a ~$40/mo VPS handles about 1 render/s). The June audit's "$5–15 per 1k" applies to *hosted* browser APIs, not yours.
- **Fixed costs** are probably about $50–150/mo across the stack (estimate; check your bills). At $19/site you break even around 5–8 customers.
- **The real risk is CAC against willingness to pay.** Developers won't pay at all, and non-developers pay per site, not per render. So price by site: **$9–19 per site per month** and **$49–79/mo for agencies with 10–25 sites**. Drop per-render tiers for this segment.
- **12-month scenarios (assumptions, not forecasts):**

| Scenario | Paying sites / agencies | Blended ARPU | Month-12 MRR |
|---|---|---|---|
| Conservative | 50 | $15 | ~$750 |
| Base | 200 | $15 | ~$3K |
| Upside | 600 | $15 | ~$9K |

  Benchmark: Bannerbear reached $16K MRR roughly 2 years in ([IH podcast](https://www.indiehackers.com/podcast/208-jon-yongfook)).

### CMO
- **Channels, ranked by fit:**
  1. Platform marketplaces: Framer (developers keep 100% of revenue, no review; [Framer](https://www.framer.com/help/articles/how-to-publish-a-plugin/)), Webflow Apps, Shopify App Store
  2. Programmatic SEO pages like "fix social preview in {Lovable|Framer|Webflow|Bolt|v0}"
  3. A free "preview checker" tool as a lead magnet
  4. MCP directories (mcp.so, mcpmarket)
- **Message:** "Every page of your site looks great when shared. Install once, never think about it." Drop "3 lines of code."
- **Proof asset:** before/after grids of real Lovable/Framer sites with broken previews. That's a natural fit for X and Reddit.

## 4. Options scored

| Option | Market pull | Competition | Fit with existing code | Solo feasibility | Verdict |
|---|---|---|---|---|---|
| A. Stay: OG API for developers | Low | Free substitutes | 100% | Yes | **Kill** |
| B. Template image API (Bannerbear clone) | Medium | Price war down to $0.005/img | 70% | Hard (distribution) | Avoid |
| C. **Social-preview autopilot for no-code/vibe-coded sites** | Medium–high (volume) | Thin, but platforms could build it | 80% (renderer, brand, edge worker) | Yes | **Recommended** |
| D. Brand-visuals MCP/API for AI agents | Rising (97M MCP SDK downloads/mo, [Medium](https://medium.com/mcp-server/the-rise-of-mcp-protocol-adoption-in-2026-and-emerging-monetization-models-cb03438e985c)) | Placid MCP, Firecrawl | 70% | Yes, as an add-on | **Add-on to C** |
| E. AI ad creative for SMBs | High ($15.9M ARR comparable) | Pomelli (free), AdCreative, Canva | 30% | No | Avoid |
| F. Open-source it and use it as a portfolio piece | n/a | n/a | 100% | Yes | **Fallback if C fails** |

## 5. 30-day plan with kill criteria

| Week | Do | Success signal |
|---|---|---|
| 1 | Fix CTO #1–4 (≤1 day). Build a landing page for "social-preview autopilot" with a real price. Manually generate before/after previews for 30 Lovable/Framer sites you find on X or showcases, and DM the owners | ≥10 replies |
| 2 | Concierge: set up previews by hand (edge worker, or give them the tags to paste) for anyone who says yes. Charge from day 1 ($9) | ≥3 paying |
| 3 | Ship a Framer plugin *or* a Lovable-friendly snippet, whichever channel got more replies. Add a free preview-checker page | ≥50 checker uses/week |
| 4 | Talk to 5 agencies: "$49/mo for 10 client sites?" Publish the MCP server (reuse the render + brand actions) | ≥1 agency paying |

**Kill rule:** at day 30, if you have fewer than 5 paying customers in total, stop. Open-source the renderer and brand pipeline (option F) and move on. You'll still have a strong portfolio project.

## 6. Assumptions to watch

- Lovable, Framer, and Webflow could each ship automatic OG images themselves. That's the biggest risk to option C. Reduce it by selling cross-platform to agencies.
- The CTR-lift figures come from vendors and are directional. Your own before/after tests with customers would be better evidence.
- The market-size figures ($4.18B gen-AI advertising in 2026, [TBRC](https://www.thebusinessresearchcompany.com/report/generative-artificial-intelligence-ai-in-advertising-global-market-report)) describe the broad category and are **not** OGSnap's addressable market.
