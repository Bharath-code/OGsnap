# OGSnap — Architecture & Performance Strategy
## Frontend Architecture, Folder Structure & Performance Optimization

---

## 1. Current Architecture Review

### Existing Structure (from docs)

The current docs show:
- **Monorepo** with pnpm workspaces
- **Apps**: `apps/api` (Fastify), `apps/web` (Next.js dashboard + marketing)
- **Packages**: `@ogsnap/core`, `@ogsnap/next`, `@ogsnap/astro`

### Architecture Question: App + Landing Page Same or Separate?

**Answer: SAME Next.js App (Recommended)**

For OGSnap, having landing page + dashboard in the same Next.js app is the RIGHT choice because:

| Factor | Same App | Separate Apps |
|--------|----------|---------------|
| SEO | ✅ Easy (App Router SSG) | ❌ Two apps = split SEO |
| Shared components | ✅ Yes | ❌ Duplication |
| Deploy pipeline | ✅ Single Vercel | ❌ Two deployments |
| Auth | ✅ Shared session | ❌ Separate auth |
| Performance | ✅ Shared bundle | ❌ Two bundles |
| Development | ✅ Single repo | ❌ Context switching |

---

## 2. Recommended Folder Structure

```
ogsnap/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── apps/
│   ├── web/                          # Next.js App (Landing + Dashboard)
│   │   ├── src/
│   │   │   ├── app/                 # App Router pages
│   │   │   │   ├── (marketing)/     # Marketing pages (SSG)
│   │   │   │   │   ├── page.tsx    # Homepage /
│   │   │   │   │   ├── pricing/
│   │   │   │   │   ├── docs/
│   │   │   │   │   └── layout.tsx
│   │   │   │   │
│   │   │   │   ├── (auth)/         # Auth pages
│   │   │   │   │   ├── login/
│   │   │   │   │   └── signup/
│   │   │   │   │
│   │   │   │   ├── (dashboard)/    # Protected dashboard
│   │   │   │   │   ├── layout.tsx   # Dashboard shell
│   │   │   │   │   ├── page.tsx     # Overview
│   │   │   │   │   ├── keys/
│   │   │   │   │   ├── brand/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   ├── billing/
│   │   │   │   │   └── settings/
│   │   │   │   │
│   │   │   │   ├── api/             # API routes
│   │   │   │   │   ├── webhooks/
│   │   │   │   │   └── auth/
│   │   │   │   │
│   │   │   │   └── layout.tsx       # Root layout
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/              # Base UI components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── modal.tsx
│   │   │   │   │   ├── toast.tsx
│   │   │   │   │   └── ...
│   │   │   │   │
│   │   │   │   ├── marketing/       # Landing page components
│   │   │   │   │   ├── hero.tsx
│   │   │   │   │   ├── live-demo.tsx
│   │   │   │   │   ├── code-preview.tsx
│   │   │   │   │   ├── pricing-table.tsx
│   │   │   │   │   ├── social-proof.tsx
│   │   │   │   │   ├── features-grid.tsx
│   │   │   │   │   ├── faq.tsx
│   │   │   │   │   └── footer.tsx
│   │   │   │   │
│   │   │   │   ├── dashboard/       # Dashboard components
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   ├── usage-meter.tsx
│   │   │   │   │   ├── api-key-card.tsx
│   │   │   │   │   ├── render-gallery.tsx
│   │   │   │   │   ├── analytics-chart.tsx
│   │   │   │   │   └── brand-preview.tsx
│   │   │   │   │
│   │   │   │   ├── auth/            # Auth components
│   │   │   │   │   ├── sign-in-form.tsx
│   │   │   │   │   └── sign-up-form.tsx
│   │   │   │   │
│   │   │   │   └── onboarding/      # Onboarding components
│   │   │   │       ├── wizard.tsx
│   │   │   │       ├── magic-onboarding.tsx
│   │   │   │       └── progress-bar.tsx
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── convex.ts        # Convex client
│   │   │   │   ├── auth.ts          # Auth utilities
│   │   │   │   ├── og.ts            # OGSnap SDK client
│   │   │   │   └── utils.ts
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── auth-store.ts    # Zustand auth store
│   │   │   │   └── dashboard-store.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── use-auth.ts
│   │   │   │   ├── use-og-image.ts
│   │   │   │   ├── use-analytics.ts
│   │   │   │   └── use-realtime.ts
│   │   │   │
│   │   │   └── styles/
│   │   │       └── globals.css       # Tailwind + custom
│   │   │
│   │   ├── public/
│   │   │   ├── images/
│   │   │   │   ├── og-default.png
│   │   │   │   └── brand/
│   │   │   ├── fonts/
│   │   │   └── icons/
│   │   │
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── api/                           # (Optional) Fastify API if needed
│       └── ...
│
├── packages/
│   ├── core/                         # @ogsnap/core
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── constants.ts
│   │   │   └── client.ts
│   │   └── package.json
│   │
│   ├── next/                         # @ogsnap/next
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── app-router.ts
│   │   │   └── pages-router.ts
│   │   ├── README.md
│   │   └── package.json
│   │
│   ├── astro/                        # @ogsnap/astro
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── handler.ts
│   │   ├── README.md
│   │   └── package.json
│   │
│   └── ui/                           # @ogsnap/ui (shared components)
│       ├── src/
│       │   ├── button.tsx
│       │   ├── input.tsx
│       │   └── ...
│       └── package.json
│
├── docs/                             # Project docs
│
├── scripts/
│
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── tailwind.config.ts
├── next.config.js
└── .env.example
```

---

## 3. Page Routing Structure

### App Router (Next.js 14+)

```
Route Grouping Strategy:

app/
├── (marketing)/          # Static marketing pages (SSG)
│   ├── page.tsx         # Homepage /
│   ├── pricing/         # /pricing
│   ├── docs/            # /docs
│   └── layout.tsx       # Marketing layout (no auth required)
│
├── (auth)/              # Authentication pages
│   ├── login/           # /login
│   ├── signup/          # /signup
│   └── layout.tsx       # Auth layout
│
├── (dashboard)/         # Protected dashboard (SSR + auth)
│   ├── layout.tsx       # Dashboard shell + auth check
│   ├── page.tsx         # /dashboard
│   ├── keys/            # /dashboard/keys
│   ├── brand/           # /dashboard/brand
│   ├── analytics/       # /dashboard/analytics
│   ├── billing/         # /dashboard/billing
│   └── settings/        # /dashboard/settings
│
├── api/                 # API routes
│   ├── webhooks/
│   │   └── stripe/
│   └── auth/
│       └── [...nextauth]/
│
├── layout.tsx           # Root layout
└── globals.css          # Global styles
```

### Why This Routing Structure?

| Group | Rendering | Auth | Purpose |
|-------|-----------|------|---------|
| `(marketing)` | SSG/ISR | No | SEO, fast, cached |
| `(auth)` | SSR | No | Dynamic, clean URLs |
| `(dashboard)` | SSR | Yes | Protected, real-time |
| `api/` | API Routes | Yes | Webhooks, auth |

---

## 4. Frontend Performance Strategy

### Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| LCP (Largest Contentful Paint) | < 1.5s | Core Web Vital |
| FID (First Input Delay) | < 100ms | Interactivity |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |
| TTFB (Time to First Byte) | < 600ms | Server response |
| FCP (First Contentful Paint) | < 1.0s | Perceived speed |

### Performance Optimization Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE LAYERS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  LAYER 1: BUILD OPTIMIZATION                                    │
│  ├── Next.js bundle analysis (@next/bundle-analyzer)           │
│  ├── Code splitting by route (automatic in App Router)          │
│  ├── Tree shaking for shared components                         │
│  └── Import optimization (no default exports)                    │
│                                                                  │
│  LAYER 2: RENDERING STRATEGY                                   │
│  ├── Marketing pages: SSG + ISR (revalidate: 60)               │
│  ├── Dashboard: SSR with Suspense                               │
│  ├── Static assets: CDN with long cache                         │
│  └── Images: next/image with lazy loading                       │
│                                                                  │
│  LAYER 3: DATA FETCHING                                        │
│  ├── Server components for initial load                         │
│  ├── Client components only where needed                        │
│  ├── React Query / Convex for client data                      │
│  └── Prefetch on hover for navigation                          │
│                                                                  │
│  LAYER 4: ASSET OPTIMIZATION                                   │
│  ├── Images: WebP/AVIF, lazy loading, blur placeholders        │
│  ├── Fonts: next/font (self-hosted, subset)                    │
│  ├── CSS: Tailwind with purging                                │
│  └── JS: Compression (Brotli > Gzip)                           │
│                                                                  │
│  LAYER 5: CDN & CACHING                                       │
│  ├── Vercel Edge Network                                       │
│  ├── Cloudflare for static assets                               │
│  ├── Stale-while-revalidate for dashboard                      │
│  └── API response caching                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Implementation Checklist

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Bundle analyzer (dev only)
  ...(process.env.ANALYZE === 'true' && {
    bundleAnalyzerReporter: {
      analyzerMode: 'static',
      reportFilename: 'bundle.html',
    },
  }),
};
```

### Component Performance Patterns

```typescript
// 1. Client components only when needed
'use client';

import { useState } from 'react';

// BAD: Client component for static content
'use client';
export function Hero() {
  return <h1>Static Title</h1>; // ❌ Unnecessary hydration
}

// GOOD: Server component by default
export function Hero() {
  return <h1>Static Title</h1>; // ✅ Server rendered
}

// 2. Lazy load heavy components
import dynamic from 'next/dynamic';

const PricingTable = dynamic(
  () => import('@/components/pricing-table'),
  { 
    loading: () => <Skeleton />,
    ssr: false // Only load on client
  }
);

// 3. Prefetch on hover
<Link href="/dashboard" prefetchOnHover>
  Dashboard
</Link>

// 4. Image optimization
import Image from 'next/image';

<Image
  src="/og-default.png"
  alt="OGSnap"
  width={1200}
  height={630}
  priority // Load immediately for hero
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### Font Optimization

```typescript
// app/layout.tsx
import { Geist } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-geist',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 6. Marketing Pages Performance (SSG + ISR)

```typescript
// app/(marketing)/page.tsx
export const revalidate = 60; // ISR: Regenerate every 60 seconds

export default async function HomePage() {
  // This runs at build time + revalidate interval
  const stats = await getStats(); // Cached
  
  return (
    <main>
      <Hero />
      <LiveDemo />
      <PricingTable />
    </main>
  );
}
```

| Page | Rendering | Cache Strategy |
|------|-----------|----------------|
| Homepage | SSG + ISR | Revalidate: 60s |
| Pricing | SSG | Long cache |
| Docs | SSG | Long cache |
| /dashboard/* | SSR | No cache |
| API/* | API Routes | No cache |

---

## 7. Dashboard Performance (Real-time)

```typescript
// Using Convex for real-time data
'use client';

import { useQuery } from 'convex/react';
import { api } from '@/lib/convex';

export function UsageMeter() {
  // Real-time subscription to usage
  const usage = useQuery(api.usage.getCurrent);
  
  if (!usage) return <Skeleton />;
  
  const percentage = (usage.used / usage.limit) * 100;
  
  return (
    <div>
      <div style={{ width: `${percentage}%` }} />
    </div>
  );
}
```

### Dashboard Optimizations

| Optimization | Implementation |
|-------------|----------------|
| Real-time data | Convex subscriptions |
| Optimistic updates | React actions |
| Loading states | Suspense boundaries |
| Error boundaries | Error boundaries |
| Prefetching | next/navigation prefetch |

---

## 8. Bundle Size Strategy

### Target Bundle Sizes

| Chunk | Target Size |
|-------|-------------|
| Initial JS | < 80KB |
| Total Page | < 200KB |
| Largest Component | < 50KB |

### Bundle Analysis Command

```bash
# Analyze bundle
ANALYZE=true pnpm build

# Check with Chrome DevTools
# Coverage tab → See unused code
```

### Common Bundle Busters to Avoid

```
┌─────────────────────────────────────────────────────────────────┐
│                     BUNDLE BUSTERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ❌ Importing entire lodash                                     │
│     → Use: import { debounce } from 'lodash-es'               │
│                                                                  │
│  ❌ Large icon libraries                                        │
│     → Use: Lucide (tree-shakeable)                            │
│                                                                  │
│  ❌ Moment.js                                                   │
│     → Use: date-fns or dayjs                                   │
│                                                                  │
│  ❌ Default Chart.js import                                    │
│     → Use: lazy import with dynamic()                          │
│                                                                  │
│  ❌ All UI components in one file                               │
│     → Use: Individual component imports                        │
│                                                                  │
│  ✅ Use: code splitting                                        │
│  ✅ Use: lazy loading                                          │
│  ✅ Use: tree shaking                                          │
│  ✅ Use: bundle analyzer                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Image Optimization Strategy

### OG Image Generation Performance

```
┌─────────────────────────────────────────────────────────────────┐
│                 IMAGE PIPELINE OPTIMIZATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CDN CACHING (Primary)                                      │
│     └── Cloudflare Edge Cache                                   │
│         ├── Cache key: URL hash + params                       │
│         ├── TTL: 24 hours (configurable)                       │
│         └── HIT rate target: >90%                               │
│                                                                  │
│  2. BROWSER CACHING (Secondary)                                │
│     └── Browser cache for returning users                       │
│         ├── Service worker for offline                          │
│         └── Preload next likely images                         │
│                                                                  │
│  3. LAZY LOADING                                               │
│     └── Below-fold images load on scroll                        │
│         ├── next/image lazy loading                            │
│         └── Blur placeholder while loading                      │
│                                                                  │
│  4. FORMAT OPTIMIZATION                                         │
│     └── Serve modern formats                                    │
│         ├── AVIF (primary, smallest)                           │
│         ├── WebP (fallback)                                    │
│         └── PNG/JPEG (final fallback)                         │
│                                                                  │
│  5. SIZE OPTIMIZATION                                           │
│     └── Responsive images                                       │
│         ├── Generate multiple sizes                            │
│         ├── Serve based on viewport                            │
│         └── Use next/image properly                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Image Loading Patterns

```typescript
// Hero image - load immediately
<Image
  src="/hero.png"
  width={1920}
  height={1080}
  priority
  alt="Hero"
/>

// Below fold - lazy load
<Image
  src="/screenshot.png"
  width={800}
  height={450}
  alt="Dashboard screenshot"
/>

// Multiple sizes for responsiveness
<Image
  srcSet="
    /img-320.webp 320w,
    /img-640.webp 640w,
    /img-1024.webp 1024w,
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
/>
```

---

## 10. Monitoring & Performance

### Performance Monitoring Stack

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Core Web Vitals |
| Sentry | Error tracking |
| Datadog | APM (if needed) |
| Chrome Lighthouse | Audits |

### Key Metrics to Track

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE METRICS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CORE WEB VITALS                                                │
│  ├── LCP: Largest Contentful Paint (< 1.5s)                   │
│  ├── FID: First Input Delay (< 100ms)                          │
│  └── CLS: Cumulative Layout Shift (< 0.1)                     │
│                                                                  │
│  RENDERING METRICS                                             │
│  ├── TTFB: Time to First Byte (< 600ms)                      │
│  ├── FCP: First Contentful Paint (< 1.0s)                     │
│  └── TTI: Time to Interactive (< 3.5s)                        │
│                                                                  │
│  BUSINESS METRICS                                              │
│  ├── Conversion rate by page load time                         │
│  ├── Bounce rate by page load time                             │
│  └── Support tickets by performance issues                     │
│                                                                  │
│  INFRASTRUCTURE                                                 │
│  ├── API response time                                          │
│  ├── Cache hit rate                                            │
│  └── Error rate                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Performance Budget (package.json)

```json
{
  "scripts": {
    "lint": "next lint",
    "build": "next build",
    "analyze": "ANALYZE=true next build"
  },
  "bundlesize": [
    {
      "path": ".next/static/**/*.js",
      "maxSize": "200kB"
    }
  ]
}
```

---

## 11. Mobile Performance

### Mobile Optimization Checklist

| Optimization | Implementation |
|-------------|----------------|
| Viewport meta | `<meta name="viewport" content="width=device-width, initial-scale=1" />` |
| Touch targets | Minimum 44x44px |
| Font size | Minimum 16px (no zoom on input) |
| CSS containment | Contain: content for lists |
| Reduced motion | Respect `prefers-reduced-motion` |
| Offline support | Service worker for dashboard |
| PWA | manifest.json + service worker |

### Responsive Images

```css
/* Use srcset for responsive images */
.hero-image {
  content: 
    url('/hero-mobile.jpg') 1x,
    url('/hero-tablet.jpg') 2x,
    url('/hero-desktop.jpg') 3x;
}

/* Art direction with picture */
<picture>
  <source media="(min-width: 1024px)" srcSet="/large.jpg" />
  <source media="(min-width: 640px)" srcSet="/medium.jpg" />
  <img src="/small.jpg" alt="Hero" />
</picture>
```

---

## Summary: Performance Architecture

### Key Takeaways

1. **Single Next.js App** for landing + dashboard (best for SEO + DX)
2. **App Router** with route groups: `(marketing)`, `(auth)`, `(dashboard)`
3. **SSG + ISR** for marketing pages (fast, cached)
4. **SSR + Real-time** for dashboard (dynamic, authenticated)
5. **Target**: LCP < 1.5s, FID < 100ms, CLS < 0.1
6. **Bundle**: < 200KB total page weight
7. **Images**: CDN cached, modern formats, lazy loading
8. **Monitor**: Vercel Analytics + Sentry

### Development Commands

```bash
# Development
pnpm dev

# Build with bundle analysis
ANALYZE=true pnpm build

# Production preview
pnpm start

# Performance audit
pnpm lighthouse # or use Chrome DevTools
```

---

*This architecture should be implemented alongside the UX documentation (12-15) and design system (06).*
