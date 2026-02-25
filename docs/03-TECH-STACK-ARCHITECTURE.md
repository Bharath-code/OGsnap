# OGSnap — Tech Stack & Architecture
**Decision Date:** February 2026  
**Principle:** Boring tech wins. Choose tools you already know.

---

## Tech Stack

### Backend (API & DB)
| Layer | Choice | Why |
|-------|--------|-----|
| Platform | **Convex** | Replaces Database, API Server, Queue, and Cache in one platform |
| DB | **Convex DB** | Realtime, TypeScript-first, auto-scaling |
| API/Functions | **Convex Queries & Mutations** | End-to-end type safety with Next.js |
| Background Jobs | **Convex Actions & Scheduling** | Replaces BullMQ and worker polling |
| OG Renderer | **Playwright + Chromium** | Runs inside a serverless environment (e.g., Vercel/Railway) triggered by Convex |
| Cache | **Convex DB** | Edge-cached queries natively replace Redis |
| Auth | **Clerk** | Drops right into Convex, vastly simpler than rolling custom JWT auth |
| File Storage | **Cloudflare R2** | Free egress, S3-compatible API. Store brand logos and rendered images here. |
| Billing | **Razorpay / DodoPayments** | Stripe alternative for India context. Webhooks sync directly to Convex. |

### Frontend (Dashboard)
| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js 14 App Router** | You know React. App Router is the future. |
| Styling | **Tailwind CSS** | Fast to build, easy to maintain, no CSS files to manage |
| Components | **shadcn/ui** | Copy-paste components, you own the code, zero lock-in |
| Charts | **Recharts** | Simple, React-native, enough for analytics dashboard |
| State | **Zustand** | Lightweight, no boilerplate, perfect for this scale |
| Forms | **React Hook Form + Zod** | Type-safe validation end-to-end |

### Infrastructure
| Service | Choice | Monthly Cost |
|---------|--------|-------------|
| Backend / DB | **Convex** | Free tier (very generous) → Pay as you go |
| Dashboard hosting | **Vercel** | Free tier |
| Renderer hosting | **Vercel / Railway** | Free tier / $5-10/month |
| File storage | **Cloudflare R2** | Free for first 10GB |
| CDN / Image delivery | **Cloudflare** | Free |
| DNS | **Cloudflare** | Free |
| Email (transactional) | **Resend** | Free → $20/month |
| Monitoring | **UptimeRobot** | Free |
| Error tracking | **Sentry** | Free tier |

**Total infra cost at launch: ~$25-50/month**  
**Total infra cost at $3K MRR: ~$150-200/month**  
**Margin: 90%+**

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                             │
│  @ogsnap/next  @ogsnap/astro  @ogsnap/svelte  Direct API   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (Direct to Convex Edge)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONVEX HTTP ENDPOINT                      │
│                                                             │
│  [POST] /api/render                                         │
│  ├── Check DB for cached render (HIT → return URL instantly)│
│  ├── MISS → `ctx.scheduler.runAfter` (trigger Action)       │
│  └── Return pending status / wait for image                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ Action triggered
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONVEX ACTION (Render)                    │
│                                                             │
│  1. Fetch brand kit from Convex DB                          │
│  2. Build HTML template with user data + branding           │
│  3. Call external Playwright service (Deploy on Railway)    │
│  4. Receive PNG Buffer                                      │
│  5. Increment usage counter in DB                           │
│  6. Return image URL / Buffer                               │
└─────────────────────────────────────────────────────────────┘
                           │ Playwright Call
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              PLAYWRIGHT RENDERER (Vercel/Railway)            │
│  Accepts HTML → returns PNG Buffer                          │
│  Stores image in Cloudflare R2                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   DASHBOARD (Vercel)                         │
│                     Next.js App Router                      │
│                                                             │
│  Realtime updates via `useQuery` (Convex)                   │
│  /dashboard        → usage overview                         │
│  /dashboard/keys   → API key management                     │
│  /dashboard/brand  → brand kit editor                       │
│  /dashboard/renders → recent renders gallery                │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Convex `schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
  }).index("by_clerk", ["clerkId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    plan: v.string(), // free | hobby | pro | scale
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    renderLimit: v.number(),
  }).index("by_user", ["userId"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    keyHash: v.string(), // hashed key
    keyPrefix: v.string(), // e.g. og_live_xxxx
    name: v.string(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  }).index("by_hash", ["keyHash"]).index("by_user", ["userId"]),

  brandKits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    backgroundColor: v.string(),
    font: v.string(),
    isDefault: v.boolean(),
  }).index("by_user", ["userId"]),

  renderLogs: defineTable({
    userId: v.optional(v.id("users")), // Optional if tracking anonymous free usage
    apiKeyId: v.optional(v.id("apiKeys")),
    urlHash: v.string(), // Used for native caching/lookup instead of Redis
    originalUrl: v.string(),
    cacheHit: v.boolean(),
    r2Url: v.optional(v.string()), // The actual generated image URL
    renderTimeMs: v.optional(v.number()),
    error: v.optional(v.string()),
  }).index("by_url_hash", ["urlHash"]).index("by_user", ["userId"]),
  
  usageCounters: defineTable({
    userId: v.id("users"),
    month: v.string(), // e.g. "2026-02"
    rendersUsed: v.number(),
  }).index("by_user_and_month", ["userId", "month"]),
});
```

---

## Render Pipeline Detail

## Render Pipeline Detail (Convex Action)

```typescript
import { action } from "./_generated/server";

// The core render action — runs in Convex V8 isolate
export const generateImage = action({
  args: { 
    url: v.string(), 
    title: v.optional(v.string()), 
    brandKitId: v.id("brandKits") 
  },
  handler: async (ctx, args) => {
    // 1. Fetch data from DB
    const brandKit = await ctx.runQuery(api.brandKits.get, { id: args.brandKitId });
    
    // 2. Build HTML
    const html = buildTemplate({
      title: args.title,
      logo: brandKit.logoUrl,
      primaryColor: brandKit.primaryColor,
      // ...
    });

    // 3. Instead of running Playwright *inside* Convex (which isn't supported),
    // we call out to a dedicated microservice (Railway/Vercel) that just runs Playwright
    const response = await fetch("https://playwright-renderer.railway.app/render", {
      method: "POST",
      body: JSON.stringify({ html, plan: "free" }) // Pass plan to inform watermark decisions
    });

    const imageUrl = await response.json(); // Usually Cloudflare R2 URL

    // 4. Update usage and cache via mutation
    await ctx.runMutation(api.usage.increment, { userId: ctx.userId });
    await ctx.runMutation(api.logs.record, { urlHash: hashUrl(args.url), imageUrl });

    return imageUrl;
  }
});
```

**Critical:** Use a browser pool (2-3 Chromium instances), not spawning a new browser per request. First-time browser launch takes 2-3 seconds. Pooled requests reuse warm instances.

---

## API Key Format

```
og_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx   (production)
og_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx   (test mode, renders not counted)
```

- Prefix identifies environment at a glance
- Never store the raw key — only a bcrypt hash in DB
- Display only the prefix in dashboard (og_live_a1b2c3d4...)

---

## Security Checklist

- [ ] Rate limiting on Convex HTTP endpoints via native Convex helper patterns
- [ ] API keys hashed with Node `crypto` or WebCrypto before storage
- [ ] XSS prevention: All user inputs sanitized before HTML template injection
- [ ] CORS restricted to known origins
- [ ] Stripe/Payment webhook signature verification (managed via Convex HTTP actions)
- [ ] R2 bucket private — images served via signed URLs or CDN only
