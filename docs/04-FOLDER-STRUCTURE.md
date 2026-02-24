# OGSnap — Monorepo Folder Structure

## Overview

OGSnap is organized as a **pnpm monorepo** with 5 packages:
- `apps/api` — Fastify backend API
- `apps/web` — Next.js dashboard + marketing site
- `packages/next` — `@ogsnap/next` npm package
- `packages/astro` — `@ogsnap/astro` npm package
- `packages/core` — shared types, utilities, constants

---

## Full Structure

```
ogsnap/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Run tests on every PR
│       └── deploy.yml                # Deploy on merge to main
│
├── apps/
│   ├── api/                          # Fastify API Server
│   │   ├── src/
│   │   │   ├── index.ts              # Entry point, server bootstrap
│   │   │   ├── config.ts             # Env vars, constants
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   ├── render.ts         # POST /v1/render — core endpoint
│   │   │   │   ├── cache.ts          # POST /v1/cache/purge
│   │   │   │   ├── keys.ts           # GET/POST/DELETE /v1/keys
│   │   │   │   ├── brand.ts          # GET/POST /v1/brand
│   │   │   │   ├── usage.ts          # GET /v1/usage
│   │   │   │   ├── webhooks.ts       # POST /webhooks/stripe
│   │   │   │   └── health.ts         # GET /health
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── renderer.ts       # Core Playwright render logic
│   │   │   │   ├── browser-pool.ts   # Chromium instance pooling
│   │   │   │   ├── cache.ts          # Redis cache read/write
│   │   │   │   ├── watermark.ts      # Sharp watermark injection
│   │   │   │   ├── brand-kit.ts      # Brand kit fetch + validation
│   │   │   │   ├── usage.ts          # Usage counter increment/check
│   │   │   │   ├── storage.ts        # R2 upload/fetch
│   │   │   │   └── email.ts          # Resend transactional emails
│   │   │   │
│   │   │   ├── queue/
│   │   │   │   ├── index.ts          # BullMQ queue setup
│   │   │   │   ├── worker.ts         # Render worker process
│   │   │   │   └── jobs/
│   │   │   │       └── render-job.ts # Job definition + handler
│   │   │   │
│   │   │   ├── templates/
│   │   │   │   ├── index.ts          # Template selector
│   │   │   │   ├── card.html.ts      # Default card template (MVP)
│   │   │   │   ├── minimal.html.ts   # Minimal layout
│   │   │   │   ├── bold.html.ts      # Bold/editorial layout
│   │   │   │   └── dark.html.ts      # Dark mode layout
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts           # API key validation
│   │   │   │   ├── rate-limit.ts     # Per-key rate limiting
│   │   │   │   └── usage-check.ts    # Plan limit enforcement
│   │   │   │
│   │   │   ├── db/
│   │   │   │   ├── client.ts         # Prisma client singleton
│   │   │   │   └── queries/
│   │   │   │       ├── users.ts
│   │   │   │       ├── api-keys.ts
│   │   │   │       ├── brand-kits.ts
│   │   │   │       ├── renders.ts
│   │   │   │       └── usage.ts
│   │   │   │
│   │   │   ├── stripe/
│   │   │   │   ├── client.ts         # Stripe SDK init
│   │   │   │   ├── webhooks.ts       # Webhook event handlers
│   │   │   │   └── plans.ts          # Plan → render limit mapping
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── hash.ts           # SHA256 cache key, bcrypt
│   │   │       ├── logger.ts         # Pino logger config
│   │   │       └── errors.ts         # Custom error classes
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   └── migrations/           # Auto-generated migrations
│   │   │
│   │   ├── tests/
│   │   │   ├── render.test.ts        # Core render endpoint tests
│   │   │   ├── auth.test.ts          # API key validation tests
│   │   │   └── billing.test.ts       # Stripe webhook tests
│   │   │
│   │   ├── Dockerfile                # Production container
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                          # Next.js Dashboard + Marketing
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx        # Root layout
│       │   │   ├── page.tsx          # Homepage / landing page
│       │   │   ├── (auth)/
│       │   │   │   ├── login/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── signup/
│       │   │   │       └── page.tsx
│       │   │   │
│       │   │   └── dashboard/
│       │   │       ├── layout.tsx    # Dashboard shell (sidebar + header)
│       │   │       ├── page.tsx      # Overview (usage, recent renders)
│       │   │       ├── keys/
│       │   │       │   └── page.tsx  # API key management
│       │   │       ├── brand/
│       │   │       │   └── page.tsx  # Brand kit editor
│       │   │       ├── renders/
│       │   │       │   └── page.tsx  # Render history gallery
│       │   │       ├── analytics/
│       │   │       │   └── page.tsx  # Analytics (v1.1)
│       │   │       └── billing/
│       │   │           └── page.tsx  # Billing + plan management
│       │   │
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui components (owned)
│       │   │   │   ├── button.tsx
│       │   │   │   ├── card.tsx
│       │   │   │   ├── input.tsx
│       │   │   │   ├── badge.tsx
│       │   │   │   ├── dialog.tsx
│       │   │   │   └── ...
│       │   │   │
│       │   │   ├── dashboard/
│       │   │   │   ├── usage-meter.tsx
│       │   │   │   ├── render-gallery.tsx
│       │   │   │   ├── api-key-card.tsx
│       │   │   │   └── plan-badge.tsx
│       │   │   │
│       │   │   ├── brand-kit/
│       │   │   │   ├── color-picker.tsx
│       │   │   │   ├── font-selector.tsx
│       │   │   │   ├── logo-uploader.tsx
│       │   │   │   └── live-preview.tsx
│       │   │   │
│       │   │   └── marketing/
│       │   │       ├── hero.tsx
│       │   │       ├── live-demo.tsx  # The "paste URL, see OG image" demo
│       │   │       ├── pricing.tsx
│       │   │       ├── code-preview.tsx
│       │   │       └── framework-logos.tsx
│       │   │
│       │   ├── lib/
│       │   │   ├── api.ts            # API client (fetch wrapper)
│       │   │   ├── auth.ts           # JWT storage + refresh
│       │   │   └── utils.ts          # cn(), formatters, etc.
│       │   │
│       │   └── store/
│       │       ├── auth.ts           # Zustand auth store
│       │       └── dashboard.ts      # Dashboard state
│       │
│       ├── public/
│       │   ├── logo.svg
│       │   ├── favicon.ico
│       │   └── og-default.png        # OGSnap's own OG image
│       │
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── core/                         # @ogsnap/core — shared internals
│   │   ├── src/
│   │   │   ├── types.ts              # RenderParams, BrandKit, Plan, etc.
│   │   │   ├── constants.ts          # API endpoints, default values
│   │   │   └── client.ts            # Base HTTP client
│   │   └── package.json
│   │
│   ├── next/                         # @ogsnap/next
│   │   ├── src/
│   │   │   ├── index.ts             # Main export: generateOG()
│   │   │   ├── app-router.ts        # App Router implementation
│   │   │   └── pages-router.ts      # Pages Router implementation
│   │   ├── README.md                # Excellent docs = free marketing
│   │   └── package.json
│   │
│   └── astro/                        # @ogsnap/astro
│       ├── src/
│       │   ├── index.ts             # Main export: OGEndpoint()
│       │   └── handler.ts           # Astro endpoint handler
│       ├── README.md
│       └── package.json
│
├── docs/                             # Internal documentation (this folder)
│   ├── 01-PRD.md
│   ├── 02-MVP.md
│   ├── 03-TECH-STACK-ARCHITECTURE.md
│   ├── 04-FOLDER-STRUCTURE.md
│   ├── 05-EXECUTION-PLAN.md
│   ├── 06-DESIGN-SYSTEM.md           # + UX principles, animations, a11y
│   ├── 07-BRAND.md
│   ├── 08-STARTUP-METRICS.md
│   ├── 09-AI-AGENT-STRATEGY.md
│   ├── 10-VC-DUE-DILIGENCE.md
│   ├── 11-MOAT-DEFENSIBILITY-STRATEGY.md
│   ├── 12-UX-FLOW.md                # User journeys, psychology, interactions
│   ├── 13-WIREFRAMES.md             # Detailed wireframes for all screens
│   ├── 14-LANDING-PAGE-UX.md        # Landing page UX specification
│   └── 15-DASHBOARD-UX.md           # Dashboard UX specification
│
├── scripts/
│   ├── seed.ts                       # Seed DB with test data
│   └── test-render.ts                # Quick render smoke test
│
├── pnpm-workspace.yaml
├── package.json                      # Root package.json
├── turbo.json                        # Turborepo build config
├── .env.example                      # All required env vars documented
├── .gitignore
└── README.md                         # Monorepo setup instructions
```

---

## Key Files Explained

### `.env.example` (document every variable)
```bash
# Database
DATABASE_URL=postgresql://...

# Redis
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=ogsnap-renders

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_HOBBY_PRICE_ID=price_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# JWT
JWT_SECRET=minimum-32-chars-random-string

# Resend (email)
RESEND_API_KEY=re_...

# Internal
API_BASE_URL=https://api.ogsnap.dev
WEB_BASE_URL=https://ogsnap.dev
NODE_ENV=production
```

### `turbo.json`
```json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["build"] },
    "lint": {}
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## Development Commands

```bash
# Install all dependencies
pnpm install

# Start everything in dev mode
pnpm dev

# Start only the API
pnpm --filter api dev

# Start only the dashboard
pnpm --filter web dev

# Run all tests
pnpm test

# Build all packages
pnpm build

# Add a dependency to a specific package
pnpm --filter api add fastify
pnpm --filter web add next

# Database migrations
pnpm --filter api db:migrate
pnpm --filter api db:studio   # opens Prisma Studio
```
