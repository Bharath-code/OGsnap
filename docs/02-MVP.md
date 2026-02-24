# OGSnap — MVP Specification
**Target:** Launch in 5-6 weeks  
**Goal:** First paying customer within 30 days of launch

---

## MVP Philosophy

The MVP is NOT a demo. It is the smallest version of the product that delivers real value to a real developer and is embarrassing enough (watermark) to convert free users to paid. Every feature that isn't in this document gets cut until after first revenue.

**The MVP does exactly one thing perfectly:** Takes a URL's metadata and returns a beautiful branded OG image via API.

**Key Differentiator:** Magic Onboarding — user pastes URL, OGSnap auto-extracts their brand and generates sample images in 10 seconds. This creates the "wow factor" for Product Hunt.

---

## What's In The MVP

### ✅ Core API
```
POST https://api.ogsnap.dev/v1/render
Authorization: Bearer {api_key}

{
  "url": "https://yourblog.com/my-post",
  "title": "Optional override title",
  "description": "Optional override description",
  "image": "https://yourblog.com/thumbnail.jpg"  // optional
}

Response: image/png (1200x630)
```

That's the entire API surface at launch. One endpoint.

### ✅ Magic Onboarding (WOW Factor)
```
User action: Pastes their website URL (e.g., "https://my-saas.com")

OGSnap automatically:
1. Crawls their homepage with Playwright
2. Extracts logo from navbar
3. Reads primary/secondary colors from CSS
4. Identifies font family from stylesheet
5. Generates 5 sample OG images in 10 seconds
6. Shows them in a beautiful preview grid

Result: User sees "WTF, this is magic!" — immediate viral potential
```

### ✅ Next.js SDK (`@ogsnap/next`)
```typescript
// app/[...slug]/opengraph-image.ts
import { generateOG } from '@ogsnap/next'

export const runtime = 'edge'
export const { GET } = generateOG({
  apiKey: process.env.OGSNAP_API_KEY,
})
```
Three lines. Works in both App Router and Pages Router. Auto-reads page title and description from metadata.

### ✅ Astro SDK (`@ogsnap/astro`)
```typescript
// src/pages/og/[...slug].png.ts
import { OGEndpoint } from '@ogsnap/astro'
export const { GET } = OGEndpoint({ apiKey: import.meta.env.OGSNAP_API_KEY })
```

### ✅ Brand Kit (Basic)
- Logo upload (PNG only at MVP, max 1MB)
- Primary hex color
- Background hex color
- Font choice from dropdown (Inter, Geist, Playfair Display, JetBrains Mono, 5 options)
- One layout template only at MVP (clean card layout)

### ✅ Dashboard (Minimal)
- Sign up with email + password (no OAuth at MVP — reduces complexity)
- API key displayed on dashboard
- Usage counter (renders this month / limit)
- Last 20 renders as a simple table (URL, timestamp, cached yes/no)
- Link to billing portal

### ✅ Billing
- DodoPayments Checkout for plan upgrade (India-friendly, handles global tax)
- DodoPayments Customer Portal for cancellation/plan change
- Webhook handler for subscription events
- **Plans & Pricing:**
  - **Free:** 100 renders/mo (Watermarked)
  - **Hobby ($9/mo):** 1,000 renders/mo (No watermark) - *The $7 impulse buy threshold is fine for passive APIs, but headless Chromium is compute-heavy. $9 establishes a higher perceived value while remaining an easy personal expense.*
  - **Pro ($29/mo):** 5,000 renders/mo + Custom Fonts
  - **Scale ($99/mo):** 25,000 renders/mo + Priority Support

### ✅ Caching
- Cache every render by SHA256 hash of (api_key + url + title + description)
- Store in Redis with 24hr TTL
- Return cached image in <50ms with `X-Cache: HIT` header

### ✅ Watermark
- Free tier renders get "ogsnap.dev" text bottom-right
- Paid tiers: no watermark

---

## What's NOT In The MVP (Cut Ruthlessly)

| Feature | Why Cut |
|---------|---------|
| OAuth (Google/GitHub login) | Adds 2 days, not needed for validation |
| Analytics dashboard | Build after first 20 customers confirm they want it |
| Multiple templates | One great template beats five mediocre ones |
| SvelteKit/Remix/TanStack SDKs | Ship after Next.js SDK is validated |
| Team accounts | Zero demand until you have individual paying customers |
| Webhooks | No one will use this before product-market fit |
| White-label | Enterprise feature, not MVP |
| API docs site | README + one page is enough at launch |

---

## MVP User Journey

**Discovery → First Render in under 10 minutes:**

1. Developer finds OGSnap (HN post, npm search, blog post)
2. Lands on homepage — sees live demo with their own URL in <5 seconds
3. Clicks "Get API Key" → email + password signup (30 seconds)
4. Dashboard shows API key immediately
5. Copies npm install command for their framework
6. Pastes 3 lines into their codebase
7. Sees their first OG image render (with watermark if free)
8. Sees "Remove watermark — $7/month" prompt
9. Upgrades or saves it for later

**The 10-minute experience is the product.** If it takes 20 minutes, half your signups will leave.

---

## MVP Technical Constraints

- API must handle 100 concurrent render requests (enough for launch traffic)
- 99.5% uptime is acceptable at MVP (not 99.9%)
- Only Next.js and Astro SDKs at launch
- Single Chromium instance with a render queue (no auto-scaling yet)
- Manual monitoring (no PagerDuty, just UptimeRobot free tier)

---

## Launch Checklist

- [ ] Core render API working and tested
- [ ] `@ogsnap/next` published to npm
- [ ] `@ogsnap/astro` published to npm
- [ ] Dashboard: signup, API key display, usage counter
- [ ] Brand kit: logo + color + font
- [ ] **Magic Onboarding: URL → auto-generated images in 10 seconds**
- [ ] Multi-platform output: OG + Twitter + LinkedIn + Slack + Discord
- [ ] DodoPayments billing working end-to-end (test mode → live mode)
- [ ] Convex caching working (cache hit < 50ms)
- [ ] Watermark on free tier
- [ ] Homepage with live demo (includes Magic Onboarding demo)
- [ ] README with copy-paste quickstart
- [ ] UptimeRobot monitoring set up
- [ ] Privacy policy + Terms of service (use a generator)
- [ ] Discord server created with #showcase channel
- [ ] Show HN post drafted and ready
- [ ] "Built with OGSnap" badge assets ready
