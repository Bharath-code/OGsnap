# OGSnap — Complete System Overview
## High-Level Visual Guide for Developers, VCs & Stakeholders

---

## 1. Executive Summary Diagram

### How OGSnap Works (60-Second Explanation)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                           THE OG SNAP STORY                                       │
│                                                                                 │
│   ┌──────────┐                    ┌──────────┐                    ┌──────────┐│
│   │ DEVELOPER│                    │  OGSNAP  │                    │ SOCIAL  ││
│   │          │                    │   SYSTEM  │                    │ MEDIA   ││
│   │ Writes   │                    │          │                    │          ││
│   │ code     │  ──────────────▶  │  Takes   │  ──────────────▶  │ Twitter ││
│   │          │   "npm install    │  URL     │    Generates       │ LinkedIn││
│   │          │    @ogsnap/next" │          │    OG Image       │ Slack   ││
│   └──────────┘                    └──────────┘                    │ WhatsApp│
│        │                               │                               └────────┘
│        │                               │                                   │
│        │                               │                                   │
│   ┌────▼────┐                   ┌────▼────┐                       ┌────▼────┐
│   │ 3 lines │                   │ Beautiful│                       │  Looks  │
│   │ of code │                   │ OG Image │                       │ Amazing!│
│   └─────────┘                   └──────────┘                       └─────────┘
│                                                                                 │
│   THE RESULT: Professional OG images in 5 minutes, not 5 hours                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. High-Level Architecture (The Big Picture)

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    OGSNAP ECOSYSTEM                                  │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                              USERS & CUSTOMERS                                 │  │
│  │                                                                                │  │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐    │  │
│  │   │   Solo      │   │   Small     │   │  Agencies  │   │ Enterprise │    │  │
│  │   │ Developers  │   │   Teams     │   │            │   │   Clients  │    │  │
│  │   │             │   │             │   │            │   │            │    │  │
│  │   │ @ogsnap/next│   │   Dashboard │   │  Dashboard │   │  Custom   │    │  │
│  │   │   (SDK)     │   │   (Web)    │   │  (Web)    │   │  Domain   │    │  │
│  │   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘  │
│  │          │                  │                  │                  │           │  │
│  └──────────┼──────────────────┼──────────────────┼──────────────────┼───────────┘  │
│             │                  │                  │                  │              │
│             ▼                  ▼                  ▼                  ▼              │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                            FRONTEND LAYER                                      │  │
│  │                                                                                │  │
│  │   ┌─────────────────────────────────────────────────────────────────────┐    │  │
│  │   │                     NEXT.JS APPLICATION (Vercel)                     │    │  │
│  │   │                                                                         │    │  │
│  │   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │  │
│  │   │   │  Landing     │  │  Dashboard   │  │  Auth       │              │    │  │
│  │   │   │  Page        │  │  (Protected) │  │  (Clerk)    │              │    │  │
│  │   │   │  /           │  │  /dashboard  │  │  /login     │              │    │  │
│  │   │   └──────────────┘  └──────────────┘  └──────────────┘              │    │  │
│  │   │                                                                         │    │  │
│  │   └─────────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                             │
│                                        ▼                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                            API LAYER (Convex Edge)                            │  │
│  │                                                                                │  │
│  │   ┌─────────────────────────────────────────────────────────────────────┐    │  │
│  │   │                                                                        │    │  │
│  │   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │    │  │
│  │   │   │  /render │  │  /keys   │  │  /brand  │  │ /usage  │           │    │  │
│  │   │   │  (POST)  │  │  (CRUD)  │  │ (CRUD)   │  │  (GET)  │           │    │  │
│  │   │   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │    │  │
│  │   │        │              │              │              │                  │    │  │
│  │   │        └──────────────┼──────────────┼──────────────┘                  │    │  │
│  │   │                        │              │                                 │    │  │
│  │   │                   ┌───▼──────────────▼───┐                           │    │  │
│  │   │                   │   BUSINESS LOGIC     │                           │    │  │
│  │   │                   │   (Convex Actions)   │                           │    │  │
│  │   │                   │                      │                           │    │  │
│  │   │                   │  • Validate API key  │                           │    │  │
│  │   │                   │  • Check usage     │                           │    │  │
│  │   │                   │  • Cache lookup    │                           │    │  │
│  │   │                   │  • Queue render   │                           │    │  │
│  │   │                   │  • Watermark      │                           │    │  │
│  │   │                   └─────────────────────┘                           │    │  │
│  │   │                                                                        │    │  │
│  │   └─────────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                             │
│                                        ▼                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                           RENDERING LAYER                                     │  │
│  │                                                                                │  │
│  │   ┌─────────────────────────────────────────────────────────────────────┐    │  │
│  │   │              PLAYWRIGHT RENDERER (Vercel/Railway)                     │    │  │
│  │   │                                                                         │    │  │
│  │   │   ┌─────────────────────────────────────────────────────────────┐   │    │  │
│  │   │   │  1. Receive HTML template + brand data                      │   │    │  │
│  │   │   │  2. Launch headless browser (Chromium)                       │   │    │  │
│  │   │   │  3. Render HTML with styles                                     │   │    │  │
│  │   │   │  4. Take screenshot (PNG)                                      │   │    │  │
│  │   │   │  5. Add watermark (if free tier)                               │   │    │  │
│  │   │   │  6. Upload to storage                                          │   │    │  │
│  │   │   │  7. Return image URL                                           │   │    │  │
│  │   │   └─────────────────────────────────────────────────────────────┘   │    │  │
│  │   │                                                                         │    │  │
│  │   └─────────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                                │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                        │                                             │
│                    ┌─────────────────┼─────────────────┐                           │
│                    ▼                 ▼                 ▼                            │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐       │
│  │    CLOUDFLARE R2    │  │    CONVEX DB      │  │     CLOUDFLARE      │       │
│  │    (Image Storage)  │  │   (User Data)      │  │     (CDN Cache)     │       │
│  │                     │  │                    │  │                     │       │
│  │  • OG Images        │  │  • Users           │  │  • Cached renders  │       │
│  │  • Logos            │  │  • API Keys        │  │  • Fast delivery   │       │
│  │  • Thumbnails       │  │  • Brand Kits      │  │  • Global edge     │       │
│  │                     │  │  • Usage logs      │  │                     │       │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow Diagram

### How Data Moves Through the System

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW DIAGRAM                                   │
│                                                                                 │
│  1. USER SIGNUP FLOW                                                            │
│  ══════════════════                                                             │
│                                                                                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐          │
│  │ Developer│      │  Clerk   │      │ Convex   │      │  Convex  │          │
│  │ Signs up │ ───▶│Auth verifies│ ──▶│ creates  │ ───▶│  stores  │          │
│  │  (Web)   │      │  (OAuth)  │      │  user    │      │  user    │          │
│  └──────────┘      └──────────┘      └──────────┘      └──────────┘          │
│        │                                                       │                 │
│        │                                                       ▼                 │
│        │                                            ┌──────────────────┐        │
│        │                                            │   users table    │        │
│        │                                            │  clerkId         │        │
│        │                                            │  email           │        │
│        │                                            │  createdAt       │        │
│        │                                            └──────────────────┘        │
│        │                                                                     │
│  2. API KEY CREATION                                                          │
│  ═══════════════════                                                         │
│                                                                                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│  │ Developer│      │ Convex    │      │ Convex    │      │  Hash &  │        │
│  │ creates  │ ───▶│ validates │ ───▶│ generates │ ───▶│  stores  │        │
│  │ API key  │      │  auth    │      │  key      │      │   key    │        │
│  └──────────┘      └──────────┘      └──────────┘      └──────────┘        │
│                                                                   │            │
│                                                                   ▼            │
│                                                        ┌──────────────────┐   │
│                                                        │  api_keys table  │   │
│                                                        │  keyHash         │   │
│                                                        │  keyPrefix       │   │
│                                                        │  userId          │   │
│                                                        └──────────────────┘   │
│        │                                                                     │
│  3. OG IMAGE GENERATION                                                      │
│  ══════════════════════                                                     │
│                                                                                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│  │ Developer│      │ Convex    │      │  Check   │      │ Convex   │        │
│  │ calls    │ ───▶│ receives  │ ───▶│  Cache   │ ───▶│ queues   │        │
│  │  API     │      │ request  │      │  (HIT?)  │      │  job     │        │
│  └──────────┘      └──────────┘      └─────┬──────┘      └────┬─────┘        │
│                                             │                   │               │
│                              ┌──────────────┴───────────────┐ │               │
│                              │                              │ │               │
│                              ▼                              ▼ ▼               │
│                       ┌──────────────┐           ┌──────────────────┐        │
│                       │ CACHE HIT    │           │  CACHE MISS      │        │
│                       │              │           │                  │        │
│                       │ Return       │           │ 1. Fetch brand  │        │
│                       │ cached URL   │           │ 2. Build HTML   │        │
│                       │ instantly    │           │ 3. Playwright   │        │
│                       └──────────────┘           │ 4. Upload R2    │        │
│                                                   │ 5. Store cache│        │
│                                                   │ 6. Return URL  │        │
│                                                   └──────────────────┘        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema (ERD)

### All Tables and Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA (ERD)                                │
│                                                                                 │
│  ┌─────────────────┐         ┌─────────────────┐                             │
│  │     users       │         │  subscriptions  │                             │
│  ├─────────────────┤         ├─────────────────┤                             │
│  │ id              │◄────────│ userId          │                             │
│  │ clerkId    (UK) │    1:N │ id              │                             │
│  │ email           │         │ plan            │                             │
│  │ name            │         │ status          │                             │
│  │ createdAt       │         │ currentPeriodEnd│                             │
│  │ updatedAt       │         │ renderLimit     │                             │
│  └─────────────────┘         └─────────────────┘                             │
│         │                                                                 │ │
│         │ 1:N                                                            │ │
│         ▼                                                                 ▼ │
│  ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐│
│  │    api_keys     │         │   brand_kits    │         │  usage_counters ││
│  ├─────────────────┤         ├─────────────────┤         ├─────────────────┤│
│  │ id              │         │ id              │         │ id              ││
│  │ userId     (FK) │         │ userId     (FK) │         │ userId     (FK) ││
│  │ keyHash     (UK)│         │ name            │         │ month      (PK) ││
│  │ keyPrefix       │         │ logoUrl         │         │ rendersUsed     ││
│  │ name            │         │ primaryColor    │         │ rendersLimit    ││
│  │ lastUsedAt      │         │ secondaryColor  │         └─────────────────┘│
│  │ revokedAt       │         │ backgroundColor │                  ▲        │
│  │ createdAt       │         │ font            │                  │        │
│  └─────────────────┘         │ isDefault       │                  │        │
│         │                    │ createdAt       │                  │        │
│         │                    └─────────────────┘                  │        │
│         │                           │                               │        │
│         │ 1:N                     │ 1:N                          │        │
│         ▼                          ▼                               │        │
│  ┌─────────────────┐         ┌─────────────────┐                │        │
│  │   render_logs   │         │   webhooks      │                │        │
│  ├─────────────────┤         ├─────────────────┤                │        │
│  │ id              │         │ id              │                │        │
│  │ userId     (FK) │         │ userId     (FK) │                │        │
│  │ apiKeyId   (FK) │         │ url            │                │        │
│  │ urlHash         │         │ event          │                │        │
│  │ originalUrl      │         │ payload        │                │        │
│  │ cacheHit        │         │ createdAt      │                │        │
│  │ r2Url           │         └─────────────────┘                │        │
│  │ renderTimeMs    │                                          │        │
│  │ error           │         ┌─────────────────┐              │        │
│  │ createdAt       │         │   payments      │              │        │
│  └─────────────────┘         ├─────────────────┤              │        │
│                             │ id              │              │        │
│                             │ userId     (FK) │              │        │
│                             │ paymentTxnId    │              │        │
│                             │ amount         │              │        │
│                             │ currency       │              │        │
│                             │ status         │              │        │
│                             │ createdAt      │              │        │
│                             └─────────────────┘              │        │
│                                                                │        │
│  RELATIONSHIP LEGEND:                                         │        │
│  ────────────────                                             │        │
│  (PK) = Primary Key                                            │        │
│  (UK) = Unique Key                                             │        │
│  (FK) = Foreign Key                                            │        │
│  1:N  = One-to-Many                                           │        │
│       = Relationship                                           │        │
│                                                                │        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Screen Flow Diagram

### All Pages and How Users Navigate

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SCREEN FLOW DIAGRAM                                 │
│                                                                                 │
│                                                                                 │
│                              ┌─────────────────┐                               │
│                              │   HOMEPAGE     │                               │
│                              │   (ogsnap.dev) │                               │
│                              └────────┬────────┘                               │
│                                       │                                        │
│          ┌────────────────────────────┼────────────────────────────┐        │
│          │                            │                            │        │
│          ▼                            ▼                            ▼        │
│  ┌───────────────┐          ┌─────────────────┐          ┌─────────────┐   │
│  │  LIVE DEMO   │          │   SIGN UP NOW   │          │  VIEW DOCS  │   │
│  │  (Interactive)│          │                 │          │             │   │
│  └───────┬───────┘          └────────┬────────┘          └──────┬──────┘   │
│          │                           │                           │            │
│          │                    ┌──────▼──────┐                    │            │
│          │                    │              │                    │            │
│          │                    │   SIGN UP    │                    │            │
│          │                    │    FORM      │                    │            │
│          │                    │              │                    │            │
│          │                    └──────┬───────┘                    │            │
│          │                           │                           │            │
│          │                           ▼                           │            │
│          │                    ┌─────────────────┐                │            │
│          │                    │   ONBOARDING    │                │            │
│          │                    │   WIZARD        │                │            │
│          │                    │                 │                │            │
│          │                    │  1. Welcome    │                │            │
│          │                    │  2. Brand Kit  │                │            │
│          │                    │  3. First API  │                │            │
│          │                    └────────┬────────┘                │            │
│          │                             │                          │            │
│          │                             ▼                          │            │
│          │                    ┌─────────────────┐                │            │
│          └──────────────────▶│   DASHBOARD     │◀───────────────┘            │
│                             │   (Protected)   │                              │
│                             └────────┬────────┘                              │
│                                      │                                        │
│              ┌─────────────────────┼─────────────────────┐                  │
│              │                     │                     │                   │
│              ▼                     ▼                     ▼                   │
│     ┌───────────────┐   ┌───────────────┐   ┌───────────────┐             │
│     │  API KEYS    │   │  BRAND KIT   │   │   BILLING    │             │
│     │               │   │               │   │               │             │
│     │ • Create key │   │ • Upload logo │   │ • View plan  │             │
│     │ • View keys  │   │ • Set colors  │   │ • Upgrade    │             │
│     │ • Delete key │   │ • Choose font │   │ • Payment    │             │
│     │ • Copy key   │   │ • Preview    │   │ • History    │             │
│     └───────────────┘   └───────────────┘   └───────────────┘             │
│              │                     │                     │                   │
│              └─────────────────────┼─────────────────────┘                  │
│                                    ▼                                         │
│                         ┌─────────────────┐                                 │
│                         │   ANALYTICS     │                                 │
│                         │                 │                                 │
│                         │ • Render stats │                                 │
│                         │ • Share counts │                                 │
│                         │ • Top URLs     │                                 │
│                         │ • Platforms    │                                 │
│                         └─────────────────┘                                 │
│                                                                                 │
│  AUTHENTICATED ROUTES:                                                       │
│  ───────────────────                                                         │
│  /login → /signup → /onboarding → /dashboard/*                             │
│                                                                                 │
│  PUBLIC ROUTES:                                                              │
│  ──────────────                                                             │
│  / → /pricing → /docs → /login → /signup                                  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. User Journey Map

### Complete User Journey from First Visit to Raving Fan

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY MAP                                     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ STAGE 1: DISCOVERY (Day 0)                                             │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  CHANNELS:                                                              │ │
│  │  • Hacker News          • Twitter/X          • npm search              │ │
│  │  • Developer Reddit     • Blog post          • Friend recommendation   │ │
│  │                                                                          │ │
│  │  ↓                                                                      │ │
│  │                                                                          │ │
│  │  LANDS ON HOMEPAGE                                                     │ │
│  │  • Sees "OG images in 3 lines"                                          │ │
│  │  • Tries live demo (types their URL)                                   │ │
│  │  • Sees their OG image instantly                                       │ │
│  │  • "Wow, this actually works!"                                          │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ STAGE 2: SIGNUP (Minutes 1-5)                                          │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  CLICKS "GET API KEY"                                                  │ │
│  │  • Signs up with email or GitHub/Google                                │ │
│  │  • Gets API key instantly                                              │ │
│  │  • Guided through 3-step onboarding                                     │ │
│  │                                                                          │ │
│  │  MAGIC ONBOARDING:                                                     │ │
│  │  • Pastes their website URL                                            │ │
│  │  • AI extracts their logo, colors, fonts                              │ │
│  │  • "WTF, this is magic!"                                              │ │
│  │                                                                          │ │
│  │  FIRST RENDER:                                                         │ │
│  │  • Copies 3-line code snippet                                          │ │
│  │  • Pastes into their Next.js app                                       │ │
│  │  • Deploys                                                             │ │
│  │  • Sees their OG image live!                                           │ │
│  │  • Confetti celebration                                                │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ STAGE 3: ACTIVATION (Days 1-7)                                        │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  USES OGSNAP REGULARLY                                                │ │
│  │  • Shares blog posts on Twitter                                        │ │
│  │  • Checks dashboard for usage                                           │ │
│  │  • Sees "247 people viewed your OG image"                             │ │
│  │  • "This is actually valuable!"                                        │ │
│  │                                                                          │ │
│  │  AT 80% USAGE:                                                        │ │
│  │  • Gets email: "Only 200 renders left"                                 │ │
│  │  • Sees banner in dashboard                                           │ │
│  │  • "Maybe I should upgrade"                                           │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ STAGE 4: CONVERSION (Days 7-30)                                       │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  UPGRADES TO HOBBY ($9/mo)                                            │ │
│  │  • Removes watermark                                                   │ │
│  │  • Gets more renders                                                  │ │
│  │  • "Finally, professional images!"                                     │ │
│  │                                                                          │ │
│  │  CONTINUES USING                                                      │ │
│  │  • Adds OGSnap to more projects                                      │ │
│  │  • Shows team members                                                │ │
│  │  • "This just works"                                                  │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ STAGE 5: ADVOCACY (Month 1+)                                          │ │
│  ├─────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                          │ │
│  │  BECOMES A FAN                                                        │ │
│  │  • Tweets about OGSnap                                                │ │
│  │  • "Check out @ogsnap — so easy!"                                    │ │
│  │                                                                          │ │
│  │  REFERS FRIENDS                                                       │ │
│  │  • Uses referral link                                                 │ │
│  │  • Gets 500 free renders                                             │ │
│  │  • Friend signs up                                                   │ │
│  │                                                                          │ │
│  │  JOINS COMMUNITY                                                      │ │
│  │  • Joins Discord                                                     │ │
│  │  • Shares success stories                                             │ │
│  │  • "I'm part of something"                                           │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  KEY METRICS BY STAGE:                                                       │
│  ────────────────────                                                        │
│  Stage 1 → Visitor to Signup: >5% (target)                                  │
│  Stage 2 → Signup to First Render: >80% (target)                             │
│  Stage 3 → Free to Paid: >10% (target)                                     │
│  Stage 4 → Monthly Retention: >95% (target)                                  │
│  Stage 5 → Referral Rate: >20% (target)                                    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Technology Stack Summary

### One-Page Tech Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            TECHNOLOGY STACK                                    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                           FRONTEND                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Next.js   │  │   Tailwind  │  │   shadcn/   │  │   Zustand   │  │  │
│  │  │  (App Dir) │  │    CSS      │  │     UI      │  │   (State)   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                         │  │
│  │  Why: Best SEO, Fast, React 18, Server Components                      │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                          BACKEND                                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Convex    │  │   Clerk    │  │  DodoPay   │  │   Resend   │  │  │
│  │  │ (DB+Auth)  │  │  (Auth)    │  │ (Payments) │  │  (Email)   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                         │  │
│  │  Why: Type-safe, Real-time, Serverless, Auto-scaling                   │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                        RENDERING ENGINE                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ Playwright  │  │ Chromium   │  │    R2      │  │ Cloudflare │  │  │
│  │  │(Automation)│  │ (Browser)  │  │ (Storage)  │  │  (CDN)     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                         │  │
│  │  Why: Reliable, Full CSS support, Fast rendering, Edge caching         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                      INFRASTRUCTURE                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Vercel   │  │  Railway   │  │Cloudflare  │  │    GitHub  │  │  │
│  │  │(Frontend)  │  │ (Renderer) │  │(DNS+CDN)  │  │    (Git)   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                         │  │
│  │  Why: Free tiers, Global CDN, Easy deploy, CI/CD                      │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Business Model Summary

### How OGSnap Makes Money

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS MODEL                                         │
│                                                                                 │
│  REVENUE STREAMS:                                                              │
│  ═══════════════                                                              │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  SUBSCRIPTIONS (Primary)                                                │  │
│  │                                                                         │  │
│  │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐         │  │
│  │   │   FREE    │  │  HOBBY    │  │    PRO    │  │  SCALE   │         │  │
│  │   │    $0     │  │   $9/mo   │  │  $29/mo   │  │  $99/mo  │         │  │
│  │   │           │  │           │  │           │  │           │         │  │
│  │   │ 100       │  │  1,000    │  │  5,000    │  │  25,000   │         │  │
│  │   │ renders/  │  │ renders/  │  │ renders/  │  │ renders/  │         │  │
│  │   │  month    │  │  month   │  │  month   │  │  month   │         │  │
│  │   │           │  │           │  │           │  │           │         │  │
│  │   │ watermark │  │ no water │  │no water  │  │no water  │         │  │
│  │   │           │  │           │  │           │  │           │         │  │
│  │   │           │  │ 3 API     │  │ 10 API    │  │Unlimited  │         │  │
│  │   │           │  │  keys    │  │  keys    │  │  keys    │         │  │
│  │   └───────────┘  └───────────┘  └───────────┘  └───────────┘         │  │
│  │                                                                         │  │
│  │  TARGET: 500 paying customers × $15 ARPU = $7,500 MRR (Month 12)       │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  COST STRUCTURE (Monthly)                                               │  │
│  │                                                                         │  │
│  │   Infrastructure: ~$50-200/mo (scales with usage)                     │  │
│  │   Payment fees: ~3% of revenue                                         │  │
│  │   Support: ~$0 (self-serve, community)                                │  │
│  │                                                                         │  │
│  │  GROSS MARGIN: ~97%                                                    │  │
│  │                                                                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  UNIT ECONOMICS:                                                               │
│  ─────────────                                                               │
│                                                                                 │
│  LTV (Lifetime Value): $349 (24 months × $15 × 97% margin)                │
│  CAC (Customer Acquisition): <$50 (organic, viral)                          │
│  LTV:CAC Ratio: >7:1                                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Competitive Advantage

### Why OGSnap Wins

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        COMPETITIVE ADVANTAGES                                   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  VS VERCEL OG                                                         │    │
│  │  ───────────                                                         │    │
│  │                                                                         │    │
│  │  ❌ Next.js only                ✅ All JS frameworks                 │    │
│  │  ❌ Limited CSS                ✅ Full CSS support                   │    │
│  │  ❌ JSX required               ✅ Any framework                     │    │
│  │  ❌ No SDKs                   ✅ 3-line install SDKs                 │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  VS DIY PUPPETEER                                                     │    │
│  │  ───────────────                                                      │    │
│  │                                                                         │    │
│  │  ❌ Takes days to build      ✅ Ship in minutes                      │    │
│  │  ❌ Infrastructure burden     ✅ Fully managed                        │    │
│  │  ❌ Browser updates break   ✅ We handle maintenance                │    │
│  │  ❌ No caching               ✅ 90%+ cache hit rate                   │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  VS BANNERBEAR / PLACID                                               │    │
│  │  ─────────────────────────                                             │    │
│  │                                                                         │    │
│  │  ❌ Marketer-focused         ✅ Developer-native                    │    │
│  │  ❌ No SDKs                  ✅ Framework SDKs                       │    │
│  │  ❌ Complex templates        ✅ Code-based templates                 │    │
│  │  ❌ Expensive               ✅ 10x cheaper                          │    │
│  │                                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  OUR MOAT:                                                                   │
│  ──────────                                                                  │    │
│  1. Integration depth (10+ frameworks) = switching cost                    │    │
│  2. Magic onboarding = viral adoption                                       │    │
│  3. Template marketplace = network effects                                  │    │
│  4. Aggregate data = AI optimization advantage                             │    │
│  5. Community = defensible ecosystem                                        │    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Quick Reference Card

### One-Page Summary for VCs

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            OGSNAP AT A GLANCE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  WHAT:         Developer tool for generating OG social images                  │
│                                                                                 │
│  HOW IT WORKS:  3-line SDK install → API generates OG images → Shared online   │
│                                                                                 │
│  TARGET:       12M+ JavaScript developers building web apps                 │
│                                                                                 │
│  MARKET:        $2-4B TAM, fragmented competition, no leader                   │
│                                                                                 │
│  DIFFERENTIATION: Developer-native, multi-framework, magic onboarding        │
│                                                                                 │
│  REVENUE:       Subscription ($0-$99/mo), 97% gross margin                   │
│                                                                                 │
│  TRACTION:     Pre-launch (projected 500 customers, $7.5K MRR by Month 12)    │
│                                                                                 │
│  ASK:           $300K-600K for 12-18 months runway                          │
│                                                                                 │
│  TEAM:          Solo founder, strong product + technical skills              │
│                                                                                 │
│  WHY NOW:       Framework fragmentation (Next/Astro/Remix/Svelte) = gap    │
│                 AI makes magic onboarding possible                            │
│                 Developer experience is competitive differentiator             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

*This document provides a complete 360° view of the OGSnap system for developers and stakeholders. Share this with VCs, team members, and partners for a comprehensive understanding of how everything connects.*
