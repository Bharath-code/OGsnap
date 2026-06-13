# OGSnap — System Architecture & User Flows

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    OGSnap Architecture Overview                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

                                ┌─────────────────────┐
                                │   Developer Website  │
                                │  (Next.js/Astro/    │
                                │   SvelteKit/Remix)  │
                                └──────────┬──────────┘
                                           │
                                           │ 1. User installs SDK
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
          ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
          │  @ogsnap/next   │    │  @ogsnap/astro  │    │   Direct API    │
          │  SDK Package    │    │  SDK Package    │    │   (REST)        │
          └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
                   │                      │                      │
                   └──────────────────────┼──────────────────────┘
                                            │
                                            ▼
                              ┌─────────────────────────────┐
                              │      Internet / CDN        │
                              │    (Cloudflare Edge)       │
                              └─────────────┬───────────────┘
                                            │
                                            ▼
                              ┌─────────────────────────────┐
                              │     Next.js Web App        │
                              │   (Vercel Hosting)         │
                              │                            │
                              │  ┌─────────────────────┐  │
                              │  │  Landing Page       │  │
                              │  │  /dashboard/*       │  │
                              │  │  /api/*             │  │
                              │  └──────────┬──────────┘  │
                              └─────────────┼─────────────┘
                                            │
                                            │ HTTPS
                                            ▼
                              ┌─────────────────────────────┐
                              │     Convex Backend         │
                              │   (API + Database)         │
                              │                            │
                              │  ┌─────────────────────┐  │
                              │  │  HTTP Endpoints     │  │
                              │  │  - /api/render      │  │
                              │  │  - /api/keys        │  │
                              │  │  - /api/onboarding  │  │
                              │  └──────────┬──────────┘  │
                              │             │              │
                              │  ┌──────────┼──────────┐   │
                              │  │ Queries  │ Mutations│   │
                              │  │ - users │ - apiKeys│   │
                              │  │ - brand │ - brand  │   │
                              │  │ - usage │ - render │   │
                              │  └──────────┬──────────┘   │
                              │             │              │
                              │  ┌──────────┴──────────┐   │
                              │  │  Database Tables    │   │
                              │  │  - users            │   │
                              │  │  - subscriptions    │   │
                              │  │  - apiKeys          │   │
                              │  │  - brandKits        │   │
                              │  │  - renderLogs      │   │
                              │  │  - usageCounters   │   │
                              │  └─────────────────────┘  │
                              └─────────────┬─────────────┘
                                            │
                          ┌─────────────────┼─────────────────┐
                          │                 │                 │
              ┌───────────┴───┐   ┌─────────┴─────────┐   ┌───┴───────────┐
              │               │   │                 │   │               │
              ▼               ▼   ▼                 ▼   ▼               ▼
    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
    │  Clerk Auth      │ │  Firecrawl       │ │  DodoPayments   │ │  Cloudflare R2   │
    │  (Authentication)│ │  (Brand Extract) │ │  (Billing)      │ │  (File Storage) │
    └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
              │                                       │                 │
              │                                       │                 │
              └───────────────────────────────────────┴─────────────────┘
                                            │
                                            ▼
                              ┌─────────────────────────────┐
                              │  Playwright Renderer       │
                              │  (Microservice)            │
                              │                            │
                              │  ┌─────────────────────┐  │
                              │  │  Browser Pool       │  │
                              │  │  (Chromium)        │  │
                              │  └─────────────────────┘  │
                              └─────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    Data Flow Legend                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  ───────  User Request          ───────  API Call             ───────  Webhook
  ......   WebSocket/Realtime    - - - -  Background Job        ======   File Upload/Download
```

---

## 2. Component Details

### 2.1 Frontend Stack

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           Frontend Architecture                                 │
└────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         Next.js 15 (App Router)                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    apps/web/src/app                                │   │
│  │                                                                     │   │
│  │  /(auth)/              │  dashboard/              │  api/           │   │
│  │  ├── login/            │  ├── page.tsx            │  ├── render/    │   │
│  │  └── signup/           │  ├── keys/               │  ├── onboarding/ │   │
│  │                        │  ├── brand/              │  └── demo/      │   │
│  │                        │  ├── renders/             │                 │   │
│  │                        │  └── billing/            │                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Dependencies:                                                               │
│  • @clerk/nextjs          - Authentication                                   │
│  • convex                 - Backend queries/mutations                        │
│  • tailwindcss           - Styling                                          │
│  • @radix-ui/*           - UI components (shadcn/ui)                        │
│  • recharts              - Analytics charts                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Backend Stack (Convex)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           Convex Backend Architecture                          │
└────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         convex/ (Serverless Functions)                       │
│                                                                              │
│  http.ts                    ← HTTP endpoint handler                           │
│  schema.ts                  ← Database schema                                 │
│                                                                              │
│  ├── users/                 │  User management                               │
│  │   ├── http.ts           │    - Sync from Clerk                           │
│  │   ├── queries.ts        │    - getCurrentUser                            │
│  │   └── mutations.ts      │    - create, update                            │
│  │                                                                         │
│  ├── apiKeys/               │  API key management                           │
│  │   ├── queries.ts         │    - listByUser, verify                       │
│  │   └── mutations.ts       │    - create, revoke, rotate                   │
│  │                                                                         │
│  ├── brand/                 │  Brand kit management                         │
│  │   ├── queries.ts         │    - getDefaultBrandKit                       │
│  │   ├── mutations.ts       │    - upsertDefaultBrandKit                    │
│  │   └── actions.ts         │    - extractFromUrl (Firecrawl)               │
│  │                                                                         │
│  ├── render/                │  OG image rendering                           │
│  │   ├── queries.ts         │    - getRecentRenders                         │
│  │   ├── mutations.ts       │    - recordRender, seedSubscription          │
│  │   └── actions.ts         │    - generateImage                            │
│  │                                                                         │
│  ├── billing/               │  Subscription management                       │
│  │   ├── webhooks.ts        │    - DodoPayments webhook handler             │
│  │   └── mutations.ts       │    - createCheckout, createPortal            │
│  │                                                                         │
│  ├── onboarding/            │  Magic onboarding flow                        │
│  │   └── http.ts            │    - /v1/onboarding/magic                     │
│  │                                                                         │
│  └── usage/                 │  Usage tracking                               │
│      ├── queries.ts         │    - getUsage                                 │
│      └── mutations.ts       │    - incrementUsage                           │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         Database Schema (Convex)                             │
└─────────────────────────────────────────────────────────────────────────────┘

  users ──────────► subscriptions
     │                    │
     │                    │ 1:many
     │                    ▼
     │              apiKeys ──────────► brandKits
     │                │                    │
     │                │ 1:many             │ 1:many
     │                ▼                    ▼
     └────────────► renderLogs ◄───────────
                        │
                        │ 1:many
                        ▼
                   usageCounters
```

### 2.3 Renderer Service (Playwright)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                    Playwright Renderer Microservice                            │
└────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         apps/renderer/src/                                   │
│                                                                              │
│  index.ts              ← Fastify server entry point                           │
│  handler.ts            ← Render request handler                              │
│  pool.ts               ← Browser pool management                            │
│  watermark.ts          ← Watermark overlay (free tier)                      │
│  storage.ts            ← Cloudflare R2 upload                               │
│                                                                              │
│  Endpoints:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  POST /render                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐│   │
│  │  │  Body: { html, width?, height?, addWatermark? }               ││   │
│  │  │                                                                 ││   │
│  │  │  1. Acquire browser from pool                                  ││   │
│  │  │  2. Create new page with viewport                              ││   │
│  │  │  3. Set content (HTML)                                          ││   │
│  │  │  4. Wait for networkidle                                       ││   │
│  │  │  5. Screenshot (PNG)                                            ││   │
│  │  │  6. Apply watermark (if free tier)                             ││   │
│  │  │  7. Upload to R2                                                ││   │
│  │  │  8. Return image URL                                            ││   │
│  │  │  9. Release browser back to pool                               ││   │
│  │  └─────────────────────────────────────────────────────────────────┘│   │
│  │                                                                     │   │
│  │  Response: { imageUrl: string }                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. User Flows

### 3.1 Sign Up Flow

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                              User Sign Up Flow                                 │
└────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  User    │     │  Clerk   │     │  Web App  │     │  Convex  │
  │ Visits   │────►│  Auth   │────►│  signs    │────►│  creates │
  │ /signup  │     │  page   │     │  them in  │     │  user    │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                            │
                                                            ▼
                                                  ┌──────────────────┐
                                                  │  1. Insert into │
                                                  │     "users"     │
                                                  │  2. Insert into │
                                                  │  "subscriptions"│
                                                  │     (free plan) │
                                                  │  3. Create     │
                                                  │  default brand  │
                                                  │     kit (empty) │
                                                  └──────────────────┘
```

### 3.2 Magic Onboarding Flow

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                          Magic Onboarding Flow                                 │
└────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  Step 1: User enters URL on /dashboard/brand                              │
  └─────────────────────────────────────────────────────────────────────────────┘
  
       ┌─────────────┐         ┌──────────────────┐
       │ User enters │         │ /api/onboarding/ │
       │ https://    │────────►│ magic            │
       │ mysite.com  │         │                  │
       └─────────────┘         └────────┬─────────┘
                                        │
                                        ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  Step 2: Firecrawl extracts brand                                          │
  └─────────────────────────────────────────────────────────────────────────────┘

                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
           ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
           │ Fetch HTML    │   │ Extract meta  │   │ Find logo &   │
           │ from URL      │──►│ (title, desc) │──►│ colors        │
           └───────────────┘   └───────────────┘   └───────────────┘
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                                        ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  Step 3: Save brand kit & generate previews                                │
  └─────────────────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │ upsert       │
                    │ brandKit     │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
       ┌─────────┐   ┌─────────┐   ┌─────────┐
       │ Render 1│   │ Render 2│   │ Render 3│
       │ Welcome │   │ New     │   │ How It  │
       │         │   │Features │   │ Works   │
       └────┬────┘   └────┬────┘   └────┬────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Return all   │
                    │ 5 previews   │
                    │ to dashboard │
                    └──────────────┘
```

### 3.3 API Render Flow

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                          API Render Flow                                       │
└────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  Developer calls: POST https://api.ogsnap.dev/v1/render                   │
  └─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │  Developer  │     │   Convex    │     │   Convex    │
  │  App/SDK    │────►│   HTTP      │────►│   Query     │
  │             │     │   Endpoint  │     │   (cache?)  │
  └─────────────┘     └──────┬──────┘     └──────┬──────┘
                              │                    │
                    ┌─────────┴─────────┐         │
                    │ Check:            │         │
                    │ 1. API key valid │         │
                    │ 2. User has      │         ▼
                    │    quota         │   ┌─────────────┐
                    │ 3. Cache HIT?    │   │  CACHE HIT  │
                    └────────┬─────────┘   │ Return URL  │
                             │             └─────────────┘
                             │ NO
                             ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  Cache MISS - Generate new image                                           │
  └─────────────────────────────────────────────────────────────────────────────┘

                             │
                             ▼
                    ┌─────────────────┐
                    │  Convex Action  │
                    │  generateImage  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │  Fetch      │ │  Build HTML  │ │  Get brand  │
      │  metadata   │ │  template   │ │  kit        │
      └─────────────┘ └─────────────┘ └─────────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Playwright     │
                    │  Renderer      │
                    │  Service       │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │  Browser    │ │  Screenshot │ │  Upload to │
      │  Pool       │ │  PNG        │ │  R2        │
      └─────────────┘ └─────────────┘ └──────┬──────┘
                                             │
                                             ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  Save to database & return                                                 │
  └─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  Record render  │
                    │  in DB          │
                    │  • renderLogs   │
                    │  • usageCounter │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Return image   │
                    │  URL to client │
                    └─────────────────┘
```

### 3.4 Billing Upgrade Flow

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           Billing Upgrade Flow                                │
└────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  User clicks "Upgrade" on dashboard                                        │
  └─────────────────────────────────────────────────────────────────────────────┘

       ┌─────────────┐         ┌──────────────────┐
       │ User clicks │         │ /api/billing/    │
       │ Upgrade     │────────►│ checkout         │
       │ $9/mo       │         │                  │
       └─────────────┘         └────────┬─────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  DodoPayments    │
                              │  Checkout URL    │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Redirect user  │
                              │  to Dodo         │
                              └────────┬─────────┘
                                       │
                                       │ User enters
                                       │ payment
                                       ▼
                              ┌──────────────────┐
                              │  Dodo webhook    │
                              │  → Convex        │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Update          │
                              │  subscription    │
                              │  in DB           │
                              │  • plan: hobby   │
                              │  • limit: 1000   │
                              │  • status: active│
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Redirect to     │
                              │  /dashboard      │
                              │  (no watermark) │
                              └──────────────────┘
```

---

## 4. SDK Integration Flows

### 4.1 Next.js SDK

```typescript
// Developer adds: app/[...slug]/opengraph-image.ts
import { generateOG } from '@ogsnap/next';

export const runtime = 'edge';
export const { GET } = generateOG({
  apiKey: process.env.OGSNAP_API_KEY,
});

// Flow:
// 1. User shares link on Twitter
// 2. Twitter fetches /[...slug]/opengraph-image
// 3. Next.js calls OGSnap API
// 4. OGSnap returns OG image
```

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                            Next.js SDK Flow                                    │
└────────────────────────────────────────────────────────────────────────────────┘

  Twitter Bot ──► GET /blog/my-post/opengraph-image
                          │
                          ▼
                  ┌───────────────┐
                  │ generateOG()  │
                  │ SDK Function  │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ OGSnap API    │
                  │ /v1/render    │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ Return PNG    │
                  │ to Twitter    │
                  └───────────────┘
```

---

## 5. Environment Configuration

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                        Environment Variables                                    │
└────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┬──────────────────────────────────────────────────────┐
  │  apps/web/      │                                                      │
  │  .env.local     │  NEXT_PUBLIC_CONVEX_URL      ← From Convex dashboard  │
  │                 │  CLERK_SECRET_KEY           ← From Clerk dashboard   │
  │                 │  INTERNAL_SERVICE_SECRET    ← Shared with Convex     │
  │                 │  FIRECRAWL_API_KEY         ← From Firecrawl         │
  │                 │  DODO_API_KEY              ← From DodoPayments      │
  │                 │  RENDERER_SERVICE_URL      ← Renderer deployment    │
  └─────────────────┴──────────────────────────────────────────────────────┘

  ┌─────────────────┬──────────────────────────────────────────────────────┐
  │  apps/renderer │                                                      │
  │  .env           │  RENDERER_INTERNAL_TOKEN    ← Shared with web      │
  │                 │  AWS_ACCESS_KEY_ID          ← From Cloudflare R2   │
  │                 │  AWS_SECRET_ACCESS_KEY      ← From Cloudflare R2   │
  │                 │  R2_BUCKET_NAME             ← Your bucket         │
  └─────────────────┴──────────────────────────────────────────────────────┘

  ┌─────────────────┬──────────────────────────────────────────────────────┐
  │  Convex         │  INTERNAL_SERVICE_SECRET    ← Shared with web       │
  │  .env           │  FIRECRAWL_API_KEY         ← From Firecrawl        │
  │                 │  RENDERER_SERVICE_URL      ← Renderer deployment    │
  │                 │  RENDERER_INTERNAL_TOKEN   ← Shared with renderer   │
  └─────────────────┴──────────────────────────────────────────────────────┘
```

---

## 6. Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Next.js 15 | Landing page + Dashboard |
| Auth | Clerk | User authentication |
| Backend | Convex | API + Database + Actions |
| Renderer | Playwright | HTML → PNG conversion |
| Storage | Cloudflare R2 | Image file storage |
| Brand Extract | Firecrawl | URL → brand data |
| Billing | DodoPayments | Subscriptions |
| CDN | Cloudflare | Image delivery |
| Hosting | Vercel | Web app hosting |

---

*Generated: March 2026*
*OGSnap v1.0*
