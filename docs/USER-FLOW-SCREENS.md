# OGSnap — User Flow: Screen by Screen

---

## Overview

This document walks through every screen and interaction a user experiences in OGSnap, from first visit to generating OG images.

---

## Flow 1: First Visit (Unauthenticated)

### Screen 1.1: Landing Page (/)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 OGSnap                                           [Sign In] [Get API Key] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✨ OG images in 3 lines. Every modern JS framework.               │   │
│  │                                                                     │   │
│  │  The SaaS pipeline for Open Graph images that actually scales.     │   │
│  │                                                                     │   │
│  │  [Start Free]                              [Open Dashboard]        │   │
│  │                                                                     │   │
│  │  ✓ Brand extraction + defaults    ✓ API key and usage controls   │   │
│  │  ✓ Cache-aware render delivery    ✓ Dashboard-first operations   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🎨 Brand-Aware Output                                              │   │
│  │  Extract colors, logos, and typography once...                      │   │
│  │                                                                     │   │
│  │  ⚡ Framework Native APIs                                           │   │
│  │  Drop into route handlers...                                         │   │
│  │                                                                     │   │
│  │  🛡️ Usage And Billing Gates                                        │   │
│  │  Manage API keys...                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Features]  [Pricing]  [FAQ]                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Actions:**
- Scroll through features
- View pricing tiers
- Click "Start Free" → Sign Up

---

## Flow 2: Sign Up

### Screen 2.1: Sign Up Page (/signup)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 OGSnap                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                          Create your account                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  Continue with                                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│  │  │   Continue with │  │   Continue with │  │   Continue with │   │   │
│  │  │      Google     │  │     GitHub      │  │      Email      │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│  │                                                                     │   │
│  │                              or                                     │   │
│  │                                                                     │   │
│  │  Email address                                                      │   │
│  │  ┌────────────────────────────────────────────────────────────────┐│   │
│  │  │ your@email.com                                                ││   │
│  │  └────────────────────────────────────────────────────────────────┘│   │
│  │                                                                     │   │
│  │  [Continue with Email]                                              │   │
│  │                                                                     │   │
│  │  Already have an account? [Sign in]                                 │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Actions:**
1. Click "Continue with Google/GitHub/Email"
2. If email: enter email → receive magic link
3. If OAuth: authenticate with provider

**System Actions:**
- Clerk handles authentication
- Webhook syncs user to Convex
- Creates default subscription (free plan)

---

## Flow 3: Dashboard (Authenticated)

### Screen 3.1: Dashboard Home (/dashboard)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 OGSnap                        [User Avatar ▼]                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Dashboard                                                                 │
│  Operational control surface for v1 render infrastructure.                  │
│                                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐               │
│  │  🔑                      │  │  🎨                      │               │
│  │  API Keys                │  │  Brand Kit               │               │
│  │  Issue and manage live   │  │  Set default visual      │               │
│  │  keys                    │  │  language                │               │
│  │                          │  │                          │               │
│  │  [Open module]          │  │  [Open module]          │               │
│  └──────────────────────────┘  └──────────────────────────┘               │
│                                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐               │
│  │  📊                      │  │  💳                      │               │
│  │  Recent Renders          │  │  Billing                 │               │
│  │  Monitor usage and       │  │  Checkout and portal     │               │
│  │  cache                   │  │  actions                 │               │
│  │                          │  │                          │               │
│  │  [Open module]          │  │  [Open module]          │               │
│  └──────────────────────────┘  └──────────────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Navigation:**
- API Keys: Manage API keys
- Brand Kit: Set up branding
- Recent Renders: View render history
- Billing: Manage subscription

---

## Flow 4: API Keys Management

### Screen 4.1: API Keys (/dashboard/keys)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Dashboard     API Keys                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Your API Keys                                                              │
│  Use these keys to authenticate your requests.                            │
│                                                                             │
│  [+ Create New Key]                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Name          │  Prefix        │  Created     │  Actions           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  Production    │  og_live_x4k2  │  Feb 18, 26 │  [Copy] [Revoke]  │   │
│  │  Development   │  og_test_a1b2  │  Feb 17, 26 │  [Copy] [Revoke]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Quick Start                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  # Next.js                                                          │   │
│  │  npm install @ogsnap/next                                          │   │
│  │                                                                     │   │
│  │  # app/blog/[slug]/opengraph-image.ts                             │   │
│  │  import { generateOG } from '@ogsnap/next';                       │   │
│  │                                                                     │   │
│  │  export const { GET } = generateOG({                              │   │
│  │    apiKey: process.env.OGSNAP_API_KEY,                           │   │
│  │  });                                                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Actions:**
- [+ Create New Key] → Modal to name key → Generate
- [Copy] → Copy key to clipboard
- [Revoke] → Disable key

---

## Flow 5: Brand Kit (Magic Onboarding)

### Screen 5.1: Brand Kit (/dashboard/brand)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Dashboard     Brand Kit                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🎨 Magic Onboarding                                                │   │
│  │                                                                     │   │
│  │  Paste your site URL. We extract branding with Firecrawl and       │   │
│  │  generate 5 sample OG images.                                     │   │
│  │                                                                     │   │
│  │  ┌────────────────────────────────────────────────────────────────┐│   │
│  │  │ https://your-site.com                                       ││   │
│  │  └────────────────────────────────────────────────────────────────┘│   │
│  │                                                                     │   │
│  │  [Extract Brand & Generate Previews]                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Extracted Brand                                                    │   │
│  │                                                                     │   │
│  │  Primary: #3B82F6    Background: #0F172A    Font: Inter           │   │
│  │                                                                     │   │
│  │  [Logo: 🖼️ logo.png]                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Generated Previews (5)                                             │   │
│  │                                                                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │   │
│  │  │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │ │ [IMG]   │     │   │
│  │  │Welcome  │ │ New     │ │ How It  │ │ Get     │ │ Our     │     │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Actions:**
1. Enter website URL
2. Click "Extract Brand & Generate Previews"
3. View extracted brand details
4. View 5 generated previews

**System Actions:**
1. Firecrawl crawls URL
2. Extracts logo, colors, font
3. Saves to brandKits table
4. Generates 5 OG images with different titles

---

## Flow 6: Recent Renders

### Screen 6.1: Renders (/dashboard/renders)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Dashboard     Recent Renders                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Usage This Month: 47 / 100 renders                                        │
│  ████████████░░░░░░░░░░░░░░░░░░░░ 47%                                    │
│                                                                             │
│  [+ Create New Key]  [+ Create New Brand Kit]                              │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  URL                    │  Rendered     │  Cache   │  Time            │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  /blog/launch          │  Feb 18, 2pm │  MISS    │  1.2s            │   │
│  │  /blog/feature        │  Feb 18, 1pm │  HIT     │  45ms            │   │
│  │  /pricing              │  Feb 17, 5pm │  HIT     │  38ms            │   │
│  │  /about                │  Feb 17, 4pm │  MISS    │  890ms           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Actions:**
- View usage meter
- View render history table
- See cache hit/miss status
- See render times

---

## Flow 7: Billing

### Screen 7.1: Billing (/dashboard/billing)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Dashboard     Billing                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Current Plan: Free                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Free Plan                    You are here                         │   │
│  │                                                                     │   │
│  │  100 renders/month           Current usage: 47/100                 │   │
│  │  Watermarked                                                [Upgrade]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Available Plans                                                    │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│  │  │  Hobby $9/mo   │  │  Pro $29/mo     │  │  Scale $99/mo  │   │   │
│  │  │  1,000 renders │  │  5,000 renders  │  │  25K renders   │   │   │
│  │  │  No watermark  │  │  Custom fonts   │  │  Priority supp  │   │   │
│  │  │                 │  │                 │  │                 │   │   │
│  │  │  [Select]      │  │  [Select]      │  │  [Select]      │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Actions:**
- View current plan
- [Upgrade] → Select plan → Payment
- [Manage Subscription] → Dodo portal

---

## Flow 8: Upgrade Flow

### Screen 8.1: Checkout (External - DodoPayments)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔒 DodoPayments - Secure Checkout                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Hobby Plan                                                                │
│  $9.00 / month                                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Card information                                                    │   │
│  │                                                                     │   │
│  │  ┌────────────────────────────────────────────────────────────────┐│   │
│  │  │ 4242 4242 4242 4242                                            ││   │
│  │  └────────────────────────────────────────────────────────────────┘│   │
│  │                                                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐                               │   │
│  │  │  MM / YY     │  │  CVC         │                               │   │
│  │  └──────────────┘  └──────────────┘                               │   │
│  │                                                                     │   │
│  │  ┌────────────────────────────────────────────────────────────────┐│   │
│  │  │  Name on card                                                ││   │
│  │  └────────────────────────────────────────────────────────────────┘│   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [Pay $9.00]                                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**User Actions:**
1. Enter card details
2. Click "Pay $9.00"

**System Actions:**
1. Dodo processes payment
2. Webhook hits Convex
3. Subscription updated in DB
4. User redirected to dashboard

---

## Flow 9: Using the API (Developer)

### Step 9.1: Install SDK

```bash
npm install @ogsnap/next
```

### Step 9.2: Add to Next.js Route

```typescript
// app/blog/[slug]/opengraph-image.ts
import { generateOG } from '@ogsnap/next';

export const runtime = 'edge';
export const { GET } = generateOG({
  apiKey: process.env.OGSNAP_API_KEY!,
});
```

### Step 9.3: That's It!

When someone shares `yourblog.com/blog/my-post` on Twitter:
1. Twitter bot fetches `/blog/my-post/opengraph-image`
2. OGSnap generates OG image
3. Returns PNG
4. Twitter displays as preview card

---

## Complete User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          OGSnap User Journey                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐
    │  Visit  │ ──────► Landing Page (/)
    │  Site   │
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Sign Up │ ──────► Sign Up (/signup) → Clerk Auth → Convex DB
    │         │
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │Dashboard│ ──────► Dashboard Home (/dashboard)
    │(Home)   │
    └────┬────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────┐
│ Brand │ │ API Keys│
│ Kit   │ │         │
│       │ │         │
└───┬───┘ └───┬─────┘
    │         │
    ▼         ▼
┌──────────┐ ┌─────────────────┐
│ Enter    │ │ Create Key     │
│ URL      │ │ Copy Key       │
│          │ │                 │
└────┬─────┘ └────────┬────────┘
     │                │
     ▼                ▼
┌──────────┐ ┌─────────────────┐
│Firecrawl │ │ Install SDK    │
│Extract   │ │ Add to Route   │
│          │ │                 │
└────┬─────┘ └────────┬────────┘
     │                │
     ▼                ▼
┌──────────┐ ┌─────────────────┐
│Save Brand│ │ First Render   │
│Kit       │ │ (via Twitter)  │
│          │ │                 │
└────┬─────┘ └────────┬────────┘
     │                │
     ▼                ▼
┌──────────┐ ┌─────────────────┐
│Generate  │ │ View in        │
│5 Previews│ │ Dashboard      │
│          │ │                 │
└────┬─────┘ └────────┬────────┘
     │                │
     │         ┌──────┴──────┐
     │         │             │
     │         ▼             ▼
     │    ┌────────┐   ┌─────────┐
     │    │ HIT    │   │ Upgrade │
     │    │ Cache  │   │ Plan   │
     │    └────────┘   └─────────┘
     │                      │
     │                      ▼
     │                 ┌─────────────┐
     │                 │ Dodo Pay    │
     │                 │ No watermark│
     │                 └─────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│      Done! OG Images Working        │
└─────────────────────────────────────┘
```

---

## Summary Statistics

| Screen | URL | Purpose |
|--------|-----|---------|
| Landing | / | Marketing, conversion |
| Sign Up | /signup | Create account |
| Dashboard | /dashboard | Navigation hub |
| API Keys | /dashboard/keys | Get API keys |
| Brand Kit | /dashboard/brand | Magic onboarding |
| Renders | /dashboard/renders | View history |
| Billing | /dashboard/billing | Manage subscription |

---

*Generated: March 2026*
*OGSnap v1.0*
