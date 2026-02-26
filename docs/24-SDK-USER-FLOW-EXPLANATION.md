# 24-SDK-USER-FLOW-EXPLANATION.md

# How SDKs Add Value: Complete User Flow

## The Core Question

> "We extract brand kit and generate images - so what do the npm libraries actually do?"

---

## The Answer: SDKs Automate Everything

### Without SDK (The Painful Way)
```
Developer wants OG images for their blog
         ↓
Manually call API:
fetch('https://api.ogsnap.dev/v1/render', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer og_live_xxx' },
  body: JSON.stringify({
    url: 'https://myblog.com/my-post',
    title: 'My Blog Post',
    description: 'A great article'
  })
})
         ↓
Get URL back
         ↓
Manually add to their website's <head>:
<meta property="og:image" content="https://...">
         ↓
Repeat for every single page
```

**Problem:** 10+ lines of code per page, manual every time

---

### With SDK (The Magic Way)

```
Developer installs: npm install @ogsnap/next
         ↓
Adds 3 lines to their Next.js app:
// app/layout.tsx
import { generateOG } from '@ogsnap/next'

export const { GET } = generateOG({ 
  apiKey: process.env.OGSNAP_API_KEY 
})
         ↓
✅ DONE. Every page now has OG images automatically.

- No API calls to write
- No manual meta tags
- Auto-reads title, description from page
- Auto-generates on every page
- Cached automatically
```

---

## The Complete User Journey

### Phase 1: Discovery (0 minutes)

```
User lands on og snap.dev
         ↓
Sees: "Generate OG images in 3 lines of code"
         ↓
Tries live demo: pastes their URL
         ↓
Magic Onboarding extracts their brand
         ↓
They see: "WTF, this is magic!"
```

---

### Phase 2: Sign Up (2 minutes)

```
Click "Get Started"
         ↓
Sign up/login with Clerk (Google/GitHub and/or email magic link)
         ↓
Get API key instantly
         ↓
Dashboard shows: 
- API key
- Usage: 0/100 renders
- Brand kit (empty)
```

---

### Phase 3: Magic Onboarding (30 seconds)

```
User enters: "https://my-saas.com"
         ↓
Our system (Firecrawl):
- Extracts logo
- Extracts primary color: #3B82F6
- Extracts font: Inter
- Generates 5 sample OG images
         ↓
User sees their brand applied automatically
         ↓
Click "Save Brand Kit"
```

---

### Phase 4: Integration (3 minutes)

```
Developer: "I use Next.js"
         ↓
Install: npm install @ogsnap/next
         ↓
Add to layout.tsx:
// app/layout.tsx
import { generateOG } from '@ogsnap/next'

export const { GET } = generateOG({
  apiKey: process.env.OGSNAP_API_KEY
})
         ↓
Deploy
         ↓
✅ EVERY page on their site now has OG images
```

---

### Phase 5: Automatic Forever

```
User publishes new blog post: "How to use React"
         ↓
Next.js renders the page
         ↓
@ogsnap/next automatically:
- Reads: title, description, og:image from the page
- Sends to our API with brand kit applied
- Gets PNG back
- Returns as OG image
         ↓
Shared on Twitter → shows perfect OG image
```

---

## What Each SDK Actually Does

### The SDK is NOT just a wrapper around the API

It's much more:

```
┌─────────────────────────────────────────────────────────┐
│              @ogsnap/next (The SDK)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. AUTO-DETECT PAGE CONTENT                           │
│     - Reads title from page                            │
│     - Reads description from meta                     │
│     - Reads og:image if already exists                 │
│                                                         │
│  2. AUTO-GENERATE                                      │
│     - Called automatically by Next.js                  │
│     - No developer intervention needed                 │
│                                                         │
│  3. HANDLE CACHING                                     │
│     - Knows when to re-render vs serve cached          │
│     - Handles CDN integration                          │
│                                                         │
│  4. FRAMEWORK-SPECIFIC                                 │
│     - Next.js App Router: /opengraph-image.tsx        │
│     - Next.js Pages: /pages/api/og/[...].tsx          │
│     - Astro: /pages/og/[...].png.ts                   │
│     - SvelteKit: hooks.server.ts                       │
│                                                         │
│  5. TYPE SAFETY                                        │
│     - Full TypeScript support                          │
│     - Knows your brand kit config                      │
│     - Autocomplete for options                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Why 10 Platforms Matter

### The Developer Reality

```
Developer uses: Astro
         ↓
Searches: "OG image generator"
         ↓
Finds: @vercel/og
         ↓
Realizes: "This is Next.js only"
         ↓
Searches: "Astro OG images"
         ↓
Finds: OGSnap has @ogsnap/astro ✅
         ↓
Installs, works, pays $9/month
```

**Without SDK for their framework → They can't use us**

### Platform Support = Market Access

| Framework | Developers Who Need OG | Our SDK |
|-----------|----------------------|---------|
| Next.js | Most | ✅ @ogsnap/next |
| Astro | Growing fast | ✅ @ogsnap/astro |
| SvelteKit | Growing | ✅ @ogsnap/svelte |
| Remix | Niche but loyal | ✅ @ogsnap/remix |
| Vue/Nuxt | Large | ✅ @ogsnap/nuxt |
| Solid | Small | ✅ @ogsnap/solid |
| Qwik | Emerging | ✅ @ogsnap/qwik |

**Each SDK = Access to that entire community**

---

## The Value Stack

### Layer 1: Core Engine (The Foundation)
```
Playwright → Renders HTML to PNG
        ↓
Brand Kit → Applies colors/fonts
        ↓
API → Returns image URL
```
**Value:** We solved the hard problem (rendering)

---

### Layer 2: Magic Onboarding (The Differentiator)
```
URL input → Firecrawl extracts brand → Brand Kit created
```
**Value:** No manual work needed

---

### Layer 3: SDKs (The Automation)
```
Install → Configure → Done forever
```
**Value:** Developer writes code ONCE, never thinks about OG again

---

### The Complete Value Proposition

| What Developer Gets | Without Us | With Us |
|--------------------|-----------|---------|
| OG images for blog | 2-4 hours coding | 3 minutes setup |
| Brand consistency | Manual matching | Automatic |
| Framework support | Next.js only | 10+ frameworks |
| Maintenance | Ongoing | Zero |
| Cost | $0 (if DIY) | $9/month |

---

## The Business Model

### Why This Works

```
Developer installs @ogsnap/next
         ↓
Uses it for 1 site → $9/month
         ↓
Uses it for 10 sites → $29/month
         ↓
Site grows → 5000 renders → $29/month
         ↓
Site grows more → 25000 renders → $99/month
         ↓
Agency has 20 clients → $99/month
```

**Revenue grows as their usage grows → Natural expansion revenue**

---

## Summary

### The User Flow

```
1. Land on website → See Magic Onboarding demo
2. Sign up → Get API key  
3. Enter URL → Brand extracted automatically
4. Install SDK → 3 lines of code
5. Deploy → OG images work forever
6. Write content → OG images auto-generate
7. Share → Perfect OG images everywhere
```

### What SDKs Provide

| Feature | Benefit |
|---------|---------|
| Auto-detect content | No manual data entry |
| Framework integration | Native to their stack |
| Auto-generation | No manual API calls |
| Caching | Fast, cheap |
| Type safety | Reliable, debuggable |

### The Key Insight

**The API is for power users. The SDKs are for everyone.**

- API: Developer manually calls for each render
- SDK: Set once, works automatically forever

**SDKs = Passive revenue. API = Active usage.**

---

*Explanation Date: 2026-02-25*
