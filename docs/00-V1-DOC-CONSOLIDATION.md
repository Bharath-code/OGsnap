# OGSnap - V1 Document Consolidation (Source of Truth)
**Version:** 1.0  
**Status:** Active (Canonical)  
**Date:** February 2026

---

## Purpose

This document is the canonical decision record for v1.  
If any other document conflicts with this file, this file wins.

---

## Canonical V1 Decisions

| Domain | V1 Decision |
|---|---|
| Core architecture | Convex-first backend with external Playwright renderer |
| Frontend | Next.js App Router |
| Renderer | Playwright + Chromium microservice on Railway/Vercel |
| Auth | Clerk (OAuth and/or email magic link) |
| Billing | DodoPayments (India-friendly) |
| Storage | Cloudflare R2 |
| Caching | Convex cache records + Cloudflare CDN edge caching (no Redis in v1) |
| Brand extraction | Firecrawl for Magic Onboarding |
| API shape | Single endpoint at launch: `POST /v1/render` |
| SDK scope at launch | `@ogsnap/next` and `@ogsnap/astro` only |
| Pricing | Free 100, Hobby $9, Pro $29, Scale $99 |
| Reliability target | MVP: 99.5% uptime, improve post-launch |

---

## V1 Scope Contract

Must ship for v1:
1. Signup/login via Clerk
2. API key generation and secure storage (hashed)
3. `POST /v1/render` end-to-end render
4. Free-tier watermark
5. Usage limits and billing enforcement via DodoPayments
6. Next.js and Astro SDKs
7. Basic dashboard (keys, usage, recent renders, billing link)

Explicitly not required for v1 launch:
1. Team seats
2. Analytics dashboards
3. Template marketplace
4. Enterprise SLA workflows
5. Agentic AI features

---

## Canonical KPI Baseline (V1)

Use one baseline across docs:
- Month 1 MRR: $100
- Month 3 MRR: $800
- Month 6 MRR: $3,000
- Month 12 base-case MRR: $7,500

Stretch goals can be shown separately, but must be labeled as stretch.

---

## Document Precedence

Priority order:
1. `00-V1-DOC-CONSOLIDATION.md` (this file)
2. `01-PRD.md`
3. `02-MVP.md`
4. `03-TECH-STACK-ARCHITECTURE.md`
5. `05-EXECUTION-PLAN.md`

Reference/supporting docs must not override the files above.

---

## Consolidation Rules (Applied)

1. Replace Stripe naming with DodoPayments naming in v1 docs.
2. Replace Redis-specific cache language with Convex + Cloudflare cache language.
3. Replace Playwright-based brand extraction wording with Firecrawl.
4. Treat Fastify/Supabase/Prisma/BullMQ architecture as archived alternatives.
5. Keep all historical docs, but mark non-v1 docs as "Archived" to avoid drift.

---

## Change Control

Before changing any core technical or business assumption, update this file first and then patch dependent docs in the same commit.
