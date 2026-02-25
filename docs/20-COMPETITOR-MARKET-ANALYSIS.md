# 20-COMPETITOR-MARKET-ANALYSIS.md

# Competitor & Market Analysis: OG Image Generation

## The Existential Crisis Question

**"Why build this when @vercel/og exists? Isn't this just screenshotting HTML with Playwright? What makes us special?"**

Let's answer this honestly.

---

## Current Landscape

### 1. @vercel/og (The 800lb Gorilla)

| Aspect | Reality |
|--------|---------|
| **What it is** | React-to-SVG converter using Satori (NOT a browser) |
| **Framework** | Next.js ONLY |
| **Weekly Downloads** | 303.5K (massive adoption) |
| **Deployment** | Vercel or Node.js server only |
| **Image Format** | SVG → PNG (2MB Vercel limit) |

**Known Pain Points (from GitHub issues):**
- ❌ Font loading failures (Unicode errors - "Unsupported OpenType signature")
- ❌ CSS `text-wrap: balance` doesn't work
- ❌ Limited CSS property support
- ❌ Heavy PNG files (performance issue)
- ❌ Doesn't work on Cloudflare Workers, Bun, Deno
- ❌ React-only (no Vue, Svelte, vanilla)

### 2. remix-og-image

- **Stars**: 47 (niche)
- **Status**: Experimental, build-time only
- **Problem**: Remix-specific, not a general solution

### 3. og-image.org (Free Tool)

- Web-based editor with templates
- Manual design - NO API
- No automation, no brand extraction

### 4. Cloudinary / ImageKit

- Image transformation APIs
- NOT OG image generation
- Can't convert HTML/CSS to images

### 5. Custom Playwright Solutions

- Developers build their own
- No standardized API
- High maintenance

---

## The REAL Gap in the Market

### Non-Next.js Developers Have NO Good Option

| Framework | OG Solution |
|-----------|-------------|
| Next.js | @vercel/og ✅ |
| React (non-Next) | Painful custom setup |
| Vue | No official solution |
| Svelte | No official solution |
| Nuxt | `nuxt-og-image` (limited) |
| Remix | `remix-og-image` (47 stars) |
| Vanilla JS | Build yourself |
| PHP/Laravel | None |
| Ruby on Rails | None |
| Django | None |

**The market is Next.js-centric. 70%+ of developers using other frameworks have no OG solution.**

---

## Why "Screenshot with Playwright" is Actually the Right Approach

The user asked: *"Isn't just screenshotting HTML with Playwright enough?"*

**Yes, and here's why that's our competitive advantage:**

| Satori (@vercel/og) | Playwright (Our Approach) |
|---------------------|-------------------------|
| Subset of CSS | Full CSS support |
| React-only | Any framework |
| SVG rendering | Real browser rendering |
| Font issues | Perfect font rendering |
| Limited to Node.js | Any environment |
| 2MB limit | No arbitrary limit |

**Satori is the workaround. Playwright is the real solution.**

---

## What Makes Us Different

### The Moat Features

1. **Magic Onboarding** (Primary Differentiator)
   - Extract brand from ANY URL automatically
   - Logo, colors, fonts - no manual work
   - **No competitor has this**

2. **Framework Agnostic**
   - Works with Next.js, Vue, Svelte, React, vanilla
   - API-first, not tied to any framework
   - **No competitor offers this**

3. **Brand Kit System**
   - Save brand profiles
   - Reuse across images
   - Version control for brands

4. **Template Marketplace**
   - Community templates
   - Premium templates
   - **Data network effects**

5. **Quality Control**
   - Format selection (PNG, JPEG, WebP)
   - Quality settings
   - Resolution control

---

## The Honest Assessment

### Why This Might Fail

1. **@vercel/og improves** - Vercel could add the features we offer
2. **Commoditization** - Anyone can spin up Playwright
3. **No moat** - The tech is not defensible alone

### Why It Might Succeed

1. **Timing** - OG images matter more now (AI, social sharing)
2. **Non-Next.js market** - Huge underserved market
3. **Magic Onboarding** - If it works well, it's habit-forming
4. **Ease of use** - Developers don't want to maintain Playwright infra
5. **Brand as service** - No one else is doing this

---

## The Pivot Question

### Should We Build This?

**The honest answer: It depends on execution.**

| Factor | Assessment |
|--------|------------|
| **Market size** | Real, but fragmented |
| **Competition** | Dominant player (Vercel) but limited |
| **Differentiation** | Magic Onboarding + framework agnostic |
| **Moat** | Brand network effects (if we build it) |
| **Execution risk** | HIGH - Playwright at scale is hard |

### The Key Question

**Can we make Magic Onboarding so good that developers can't live without it?**

If yes → Build.
If no → The product is just a commodity Playwright wrapper → Not worth the effort.

---

## Recommended Strategy

### Option A: Full SaaS (Current Plan)

- Build the full platform
- Magic Onboarding as primary feature
- Monthly subscription
- Target: Developers who want "set and forget"

### Option B: Developer Tool (Simplified)

- Open source core (Playwright renderer)
- Hosted API for a fee
- No brand extraction (too complex)
- Compete on price and ease of use

### Option C: Pivot

- Focus ONLY on Magic Onboarding
- License the brand extraction API
- Partner with existing OG tools
- Lower risk, smaller market

---

## Conclusion

**The product is worth building IF:**

1. We nail Magic Onboarding (the differentiator)
2. We accept it's a commodity play initially
3. We build network effects through templates/community
4. We're willing to pivot if Magic Onboarding doesn't land

**The product is NOT worth building IF:**

1. We think Playwright alone is enough
2. We can't differentiate from @vercel/og
3. We're not willing to compete on execution

---

*Analysis Date: 2026-02-25*
