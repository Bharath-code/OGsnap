# Outreach batch 1: findings (2026-10-07)

Source lists: madewithlovable.com (public maker submissions) and buildinframer.com. 34 URLs audited with `scripts/audit-previews.ts`; raw output in `audit-batch1.csv`.

## Result

| Verdict | Count | Notes |
|---|---|---|
| ok | 30 | homepage has a working 1200px-class og:image and title |
| missing | 2 | `DoneDone.Run`, `ben-hashmashot.com` (the only qualified prospects) |
| broken | 2 | `45-cafe.com`, `alesfarm.it`: DNS failure. Domains were reconstructed from a gallery page, so treat as my error, not prospects |

## What this changes

- **Lovable now generates a social image itself.** 9 of 9 Lovable sites checked have a custom `og:image` (a screenshot in `gpt-engineer-file-uploads/social-images/` or an `id-preview` capture). The strategy review named this as the biggest risk. The homepage-pain pitch ("your link has no preview") no longer holds for Lovable.
- **The gap that remains is per-page.** Lovable sites are SPAs with one `index.html`: `/`, `/about` and a nonexistent route return the same `og:image` and `og:title` on all 4 sites tested (luna-vos, asc2, ag-whisperer, adarena). Every shared inner link looks like the homepage.
- That only matters for sites with several pages worth sharing: blogs, directories, listings, product or profile pages. A one-page landing site has nothing to fix.

## Decision (one line, per the plan's Checkpoint 1 format)

Do not send a "missing preview" DM to homepage-ok sites. Target sites with shareable inner pages and prove the gap with an inner-page before/after. Sample is 34 maker-showcase sites, so this is directional, not a market measurement.

## Batch 2 spec

1. Source sites with many shareable inner pages (blogs, directories, listings, "powered by" apps) on Lovable, Framer, Webflow.
2. For each, take 2 inner URLs and run them through the audit. Qualify when the inner image equals the homepage image (`generic`) or is missing.
3. Only then generate before/after images (needs the deployed backend) and send DMs.

## Blocked

- `before-after.ts` needs `API_BASE_URL`, `INTERNAL_SERVICE_SECRET`, `OGSNAP_USER_ID`, so it needs the prod deployment from the launch blockers.
- Nothing in this batch has been sent to anyone.
