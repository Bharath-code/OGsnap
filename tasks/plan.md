# Plan: OGSnap Pivot to Social-Preview Autopilot (30-Day Validation)

Source: `.claudedocs/strategy-review-2026-09.md`. Tasks with acceptance criteria are in `tasks/todo.md`.

## Overview
Test whether people who build sites with no-code and vibe-coding tools (Lovable, Framer, Webflow) and small agencies will pay **per site** for social previews that set themselves up automatically. Reuse the existing renderer, brand pipeline, Convex backend and edge worker. The only goal of these 30 days is to prove or disprove willingness to pay. Scaling comes later.

## Goal and decision gate
- **Day 30 gate:** ≥5 paying customers, counting sites and agencies together → continue into a v1 build plan.
- **Below 5:** stop. Open-source the renderer and brand pipeline (option F) and archive the repo.
- **Week 1 early signal:** fewer than 10 replies from 30 DMs → rewrite the message or switch segment once. Two weeks in a row of fewer than 10 replies → trigger the gate early.

## Architecture decisions
- **Brand extraction uses Firecrawl's `branding` format.** Delete the vision-LLM and regex code. You already pay for Firecrawl, and `llm.ts` currently calls a retired model.
- **The unit of billing is a site, not a render.** A new `sites` table is keyed by domain. Per-render quotas stay only for the legacy API.
- **Two install tiers, simplest first:**
  1. *Site-wide:* the customer pastes 2 meta tags pointing to `GET /v1/site/{siteId}/og.png`. Works on every platform, including SPAs (single-page apps) like Lovable, where crawlers only see `index.html`.
  2. *Per-page:* a Cloudflare Worker proxy, adapted from `packages/edge-worker`, uses HTMLRewriter to inject `og:image` for each route. Needs a custom domain behind Cloudflare.
- **No new vendors.** Use Convex, Dodo, R2 and Cloudflare, which are already wired.
- **Deferred until the gate passes:** weekly broken-preview email, analytics, team seats, SDK work, stack consolidation.

## Phases (task numbers refer to `tasks/todo.md`)
| Phase | When | Tasks | Exit checkpoint |
|---|---|---|---|
| 0. Hygiene | Day 1 | T1–T3 | Typecheck passes; landing page has no false claims |
| 1. Validation assets and outreach | Days 2–7 | T4–T7 | ≥10 replies out of 30 DMs |
| 2. Concierge delivery and payment | Days 8–14 | T8–T9 | ≥3 paying |
| 3. Per-page and channel | Days 15–21 | T10–T12 | ≥50 checker runs/week; first per-page install live |
| 4. Agencies and MCP | Days 22–30 | T13–T15 | Day 30 gate |
| L. Launch readiness | Now (added 2026-10-07) | L0–L12, then T7b | Checkpoint L: deployed, one live $9 charge made and refunded, then first DMs |

## Status note (2026-10-07)
Code for T1–T6, T8–T11 and T13 is merged; nothing is deployed and no DM has been sent. Outreach batches 1 and 2 (`.claudedocs/outreach/`) changed the targeting: Lovable now generates a social image, so the pitch is per-page previews for sites with many shareable pages. Phase L in `tasks/todo.md` is the critical path; the day-30 clock should be counted from the first DM sent, and the Decision log records that choice.

## Dependency graph
```
T1 brand extraction ─┬─> T5 before/after generator ─> T7 outreach
T4 preview audit ────┤                                  │
T2/T3 hygiene ─> T6 landing + leads ───────────────────┘
T6 ─> T8 site image endpoint ─> T9 site billing ─> T13 agency multi-site
T8 ─> T10 per-page worker
T4 ─> T11 public checker
T7 reply data ─> T12 channel spike (Framer vs Lovable)
L0–L12 launch readiness ─> T7b outreach (needs deployed backend for before/after images)
T1 + T8 + T4 ─> T14 MCP server
```

## Risks and mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Lovable, Framer or Webflow ships automatic OG images | High | Sell cross-platform to agencies (T13). Treat a platform launch as evidence the demand is real |
| SPA crawlers ignore per-route tags | Medium | Site-wide tier works everywhere. Per-page requires the proxy (T10) |
| Firecrawl `branding` output misses logos | Medium | T1 acceptance requires ≥8 of 10 correct; the manual logo upload fallback stays |
| DM outreach reads as spam | Medium | Send a free before/after image first; ask for nothing. Cap at 10 DMs/day |
| Founder drifts back into docs or code | High | No new docs in `docs/`. Every task has a numeric exit signal |

## Open questions (need your input)
1. **Goal:** indie cash flow or venture-scale? This changes what happens after the gate, not these 30 days.
2. **Framer plugin API:** can a plugin write per-page social images, or only CMS fields? T12 spike answers this.
3. **Domain for image URLs:** keep `ogsnap` or rebrand for the no-code audience? A rebrand is deferred unless outreach feedback asks for it.
