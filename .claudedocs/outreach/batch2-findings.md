# Outreach batch 2: findings (2026-10-07)

76 sites from madewithlovable.com category pages (business, websites, education, marketing, directory), probed with `scripts/probe-inner-pages.mjs`. For each: homepage og:image/og:title vs. 2 inner pages taken from `sitemap.xml`. Raw output: `inner-batch2.csv`.

## Result

| Verdict | Sites | Meaning |
|---|---|---|
| QUALIFIES | 13 | 3+ sitemap pages, inner pages serve the homepage's exact og:image and og:title |
| home-missing | 9 | no og:image on the homepage at all (6 of 9 hand-verified: no og:image or twitter:image anywhere in the HTML); several have 100-660 sitemap pages |
| per-page-ok | 14 | inner pages already differ from the homepage |
| few-pages | 32 | fewer than 3 inner pages, little to share |
| unreachable | 11 | DNS, TLS or 403 errors |

22 of 65 reachable sites (34%) have a clear gap. **This is not a market rate:** the list was deliberately chosen for directory, content and listing-style sites. For comparison, batch 1 (unfiltered showcase) found 4 of 34.

## Hand-checked
- `selected.site` (1,081 pages), `amsterdamtradingjobs.com`, `prndr.com`, `hadoseo.com`: the homepage and an inner page return identical og:image and og:title.
- `amsterdamtradingjobs.com` uses `logo.svg` as og:image; most platforms don't render SVG previews, so even its homepage preview is effectively broken.
- `musebox.io` (340 pages), `w3wu.com` (469), `easytraveldeal.com` (662), `duftkombination.de` (139): no social image tags at all.

## Top prospects (most shareable pages first)
1. selected.site (1,081), easytraveldeal.com (662, no image), w3wu.com (469, no image), musebox.io (340, no image), duftkombination.de (139, no image)
2. amsterdamtradingjobs.com (45), hadoseo.com (34), willyoumerry.me (30), hellosilvermoon.com (29), prndr.com (22)
- `prndr.com` sells prerendering for JS sites, so treat it as a partner or competitor, not a customer.
- `nicolasgrenie.com`, `qr-generator.pro` have 5 pages each: low value.

## Method caveats
- The sitemap sample is 2 pages per site; "same as home" means exact string equality of both tags.
- Tags injected by JavaScript are invisible to the scripts and to social crawlers, so they count as missing, which is what a crawler sees.
- Maker contact details were not collected. Finding each owner's email or X handle is manual work and the next step.

## Decision
The per-page gap is real and common on SPA-built content sites, and the Lovable showcase is a workable source. Day-30 gate math: 22 qualified sites, a reply rate of 10-30% would be 2-7 conversations, so a second sourcing round will be needed to reach about 30 sends.

## Next
1. Find the owner contact for the top 10 (about 20 min each, manual).
2. Deploy the backend (launch blockers 1-6), then run `before-after.ts` on one inner page per site.
3. Send 10 DMs using templates A and B, tracked in `tracker.csv`.
