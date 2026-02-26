# OGSnap - Monorepo Folder Structure (V1 Canonical)
**Status:** Active (V1)  
**Aligned With:** `00-V1-DOC-CONSOLIDATION.md`, `03-TECH-STACK-ARCHITECTURE.md`

---

## Overview

OGSnap v1 is organized as a pnpm monorepo with a Convex-first architecture.

Core workspaces:
- `apps/web` - Next.js marketing site + dashboard
- `apps/renderer` - Playwright rendering microservice
- `convex` - Convex backend (schema, queries, mutations, actions, http)
- `packages/core` - shared types and API client
- `packages/next` - `@ogsnap/next`
- `packages/astro` - `@ogsnap/astro`

---

## V1 Structure

```text
ogsnap/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── signup/page.tsx
│   │   │   │   └── dashboard/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── keys/page.tsx
│   │   │   │       ├── brand/page.tsx
│   │   │   │       ├── renders/page.tsx
│   │   │   │       └── billing/page.tsx
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── store/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── renderer/
│       ├── src/
│       │   ├── index.ts
│       │   ├── handler.ts
│       │   ├── pool.ts
│       │   ├── watermark.ts
│       │   └── storage.ts
│       ├── tests/
│       └── package.json
│
├── convex/
│   ├── schema.ts
│   ├── http.ts
│   ├── render/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── mutations.ts
│   ├── brand/
│   │   ├── actions.ts
│   │   ├── queries.ts
│   │   └── mutations.ts
│   ├── apiKeys/
│   │   ├── queries.ts
│   │   └── mutations.ts
│   ├── usage/
│   │   ├── queries.ts
│   │   └── mutations.ts
│   └── billing/
│       ├── mutations.ts
│       └── webhooks.ts
│
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   └── client.ts
│   │   └── package.json
│   ├── next/
│   │   ├── src/index.ts
│   │   ├── README.md
│   │   └── package.json
│   └── astro/
│       ├── src/index.ts
│       ├── README.md
│       └── package.json
│
├── docs/
├── scripts/
│   ├── smoke-render.ts
│   └── seed.ts
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── .env.example
```

---

## Environment Variables (V1)

```bash
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Billing (DodoPayments)
DODO_API_KEY=
DODO_WEBHOOK_SECRET=
DODO_HOBBY_PRICE_ID=
DODO_PRO_PRICE_ID=
DODO_SCALE_PRICE_ID=

# Firecrawl
FIRECRAWL_API_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=ogsnap-renders

# Internal
API_BASE_URL=https://api.ogsnap.dev
WEB_BASE_URL=https://ogsnap.dev
NODE_ENV=production
```

---

## V1 Commands

```bash
# install dependencies
pnpm install

# run all apps
pnpm dev

# run web app only
pnpm --filter web dev

# run renderer only
pnpm --filter renderer dev

# run convex local dev
pnpm convex dev

# tests
pnpm test

# build
pnpm build
```

---

## Notes

- This v1 structure intentionally avoids Fastify/Prisma/Redis/BullMQ.
- Convex handles DB, API layer, actions, and scheduling.
- Renderer remains a dedicated external service because Playwright cannot run inside Convex actions.
