# OGSnap — Firecrawl Integration Strategy
## Using Firecrawl for Brand Extraction & Content Intelligence

---

## 1. Why Firecrawl?

| Feature | Benefit for OGSnap |
|---------|---------------------|
| **Fast (<1s)** | Real-time brand extraction during onboarding |
| **JavaScript support** | Renders dynamic content, SPAs |
| **LLM-ready output** | Clean markdown/JSON for processing |
| **Actions** | Click, scroll, interact before extracting |
| **Proxy-free** | No infrastructure needed |
| **Open source** | Can self-host if needed |

---

## 2. Use Cases in OGSnap

### Use Case 1: Magic Onboarding (Brand Extraction)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   FIRECRAWL FOR BRAND EXTRACTION                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  USER ACTION:                                                           │
│  Pastes URL: https://my-saas.com                                       │
│                                                                          │
│  ↓                                                                      │
│                                                                          │
│  FIRECRAWL SCRAPES:                                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ 1. Fetch homepage HTML                                          │   │
│  │ 2. Extract:                                                     │   │
│  │    - og:image meta tag                                          │   │
│  │    - favicon                                                    │   │
│  │    - <link rel="icon">                                         │   │
│  │    - Common logo locations (header, nav, .logo class)         │   │
│  │    - Primary color from CSS                                     │   │
│  │    - Font family from stylesheet                                │   │
│  │ 3. Return structured JSON                                        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ↓                                                                      │
│                                                                          │
│  BRAND KIT GENERATED:                                                   │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  {                                                              │   │
│  │    "logo": "https://my-saas.com/logo.png",                   │   │
│  │    "primaryColor": "#6366F1",                                 │   │
│  │    "secondaryColor": "#10B981",                                │   │
│  │    "backgroundColor": "#0A0A0B",                               │   │
│  │    "fontFamily": "Inter, sans-serif",                         │   │
│  │    "fontUrl": "https://fonts.googleapis.com/..."            │   │
│  │  }                                                              │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Use Case 2: Content Change Monitoring (Auto-Regeneration)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   FIRECRAWL FOR CONTENT MONITORING                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  USER SETUP:                                                           │
│  Connects blog URL: https://my-saas.com/blog                          │
│                                                                          │
│  ↓                                                                      │
│                                                                          │
│  FIRECRAWL CRAWLS PERIODICALLY:                                        │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  1. Fetch all blog post URLs (/blog/*.html)                   │   │
│  │  2. Store content hash for each URL                            │   │
│  │ 3. Compare with previous hash                                 │   │
│  │ 4. If changed → trigger OG image regeneration                  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ↓                                                                      │
│                                                                          │
│  AUTO-UPDATE:                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  User updates blog post                                         │   │
│  │  ↓                                                             │   │
│  │  Firecrawl detects change (next crawl)                         │   │
│  │  ↓                                                             │   │
│  │  OGSnap regenerates OG image automatically                     │   │
│  │  ↓                                                             │   │
│  │  User's OG images are always fresh!                           │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Use Case 3: Analytics - Content Analysis

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   FIRECRAWL FOR ANALYTICS                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FOR ANALYTICS DASHBOARD:                                               │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  When analyzing shared URLs:                                     │   │
│  │  - Extract meta tags (title, description, og:image)          │   │
│  │  - Get social media preview data                                │   │
│  │  - Analyze content type (blog, product, docs)                  │   │
│  │  - Determine best template suggestion                            │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  FOR "WHAT'S WORKING" INSIGHTS:                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  - Analyze top-performing OG images                             │   │
│  │  - Extract patterns (colors, fonts, layouts)                   │   │
│  │  - Aggregate insights (anonymized)                              │   │
│  │  - Recommend optimizations                                     │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation

### Step 1: Firecrawl API Setup

```bash
# Install Firecrawl SDK
npm install @firecrawl/sdk

# Or use CLI
npx firecrawl-cli@latest init
```

### Step 2: Brand Extraction Function

```typescript
// lib/firecrawl.ts
import { FirecrawlApp } from '@firecrawl/sdk';

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export interface ExtractedBrand {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontUrl?: string;
  title?: string;
  description?: string;
  ogImage?: string;
}

export async function extractBrandFromUrl(url: string): Promise<ExtractedBrand> {
  // Scrape the homepage
  const scrapeResult = await firecrawl.scrape({
    url,
    formats: ['html', 'markdown', 'json'],
    onlyMainContent: true,
  });

  const html = scrapeResult.html;
  
  // Extract brand elements using regex patterns
  const brand: ExtractedBrand = {};

  // Logo extraction
  brand.logo = extractLogo(html);
  brand.favicon = extractFavicon(html);
  
  // Open Graph image
  brand.ogImage = extractOgImage(html);
  
  // Page metadata
  brand.title = extractMetaContent(html, 'og:title') || extractMetaContent(html, 'title');
  brand.description = extractMetaContent(html, 'og:description') || extractMetaContent(html, 'description');

  // Colors - extract from inline styles or CSS
  brand.primaryColor = extractPrimaryColor(html);
  brand.backgroundColor = extractBackgroundColor(html);
  
  // Fonts
  brand.fontFamily = extractFontFamily(html);
  brand.fontUrl = extractFontUrl(html);

  return brand;
}

// Helper extraction functions
function extractLogo(html: string): string | undefined {
  // Try og:image first
  const ogImage = extractMetaContent(html, 'og:image');
  if (ogImage) return ogImage;

  // Try common logo selectors in HTML
  const logoPatterns = [
    /<img[^>]+class="[^"]*logo[^"]*"[^>]+src="([^"]+)"/i,
    /<a[^>]+class="[^"]*logo[^"]*"[^>]+href="[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
    /<header[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
  ];

  for (const pattern of logoPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return undefined;
}

function extractOgImage(html: string): string | undefined {
  return extractMetaContent(html, 'og:image');
}

function extractMetaContent(html: string, property: string): string | undefined {
  // Try property attribute (Open Graph)
  const propertyPattern = new RegExp(`<meta[^>]+property="${property}"[^>]+content="([^"]+)"`, 'i');
  let match = html.match(propertyPattern);
  if (match) return match[1];

  // Try name attribute (standard meta)
  const namePattern = new RegExp(`<meta[^>]+name="${property}"[^>]+content="([^"]+)"`, 'i');
  match = html.match(namePattern);
  if (match) return match[1];

  return undefined;
}

function extractFavicon(html: string): string | undefined {
  // Try various favicon patterns
  const patterns = [
    /<link[^>]+rel="(?:shortcut )?icon"[^>]+href="([^"]+)"/i,
    /<link[^>]+href="([^"]*favicon[^"]*)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return '/favicon.ico'; // Default
}

function extractPrimaryColor(html: string): string | undefined {
  // Look for theme-color meta
  const themeColor = extractMetaContent(html, 'theme-color');
  if (themeColor) return themeColor;

  // Look for common color patterns in inline styles
  const colorPatterns = [
    /--primary:\s*(#[0-9a-fA-F]{3,6})/i,
    /--color-primary:\s*(#[0-9a-fA-F]{3,6})/i,
    /color:\s*(#[0-9a-fA-F]{3,6})/i,
  ];

  for (const pattern of colorPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return '#6366F1'; // Default brand color
}

function extractBackgroundColor(html: string): string | undefined {
  const bgPatterns = [
    /--background:\s*(#[0-9a-fA-F]{3,6})/i,
    /--bg:\s*(#[0-9a-fA-F]{3,6})/i,
    /background-color:\s*(#[0-9a-fA-F]{3,6})/i,
  ];

  for (const pattern of bgPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }

  return '#0A0A0B'; // Default dark background
}

function extractFontFamily(html: string): string | undefined {
  // Look for Google Fonts or font-family declarations
  const fontPatterns = [
    /font-family:\s*['"]?([^;'"]+)['"]?/i,
  ];

  for (const pattern of fontPatterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }

  return 'Inter, sans-serif';
}

function extractFontUrl(html: string): string | undefined {
  // Look for Google Fonts link
  const fontLinkPattern = /<link[^>]+href="([^"]*fonts\.googleapis\.com[^"]+)"/i;
  const match = html.match(fontLinkPattern);
  if (match) return match[1];

  return undefined;
}
```

### Step 3: Convex Action Integration

```typescript
// convex/actions/brand-extraction.ts
import { action } from '../_generated/server';
import { extractBrandFromUrl } from '../../lib/firecrawl';

export const extractBrand = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate URL
    if (!args.url.startsWith('http')) {
      throw new Error('Invalid URL. Must start with http:// or https://');
    }

    try {
      // Extract brand using Firecrawl
      const brand = await extractBrandFromUrl(args.url);

      return {
        success: true,
        brand,
      };
    } catch (error) {
      console.error('Brand extraction failed:', error);
      return {
        success: false,
        error: 'Failed to extract brand from URL',
      };
    }
  },
});
```

### Step 4: Frontend Integration

```typescript
// components/onboarding/magic-onboarding.tsx
'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/lib/convex';

export function MagicOnboarding() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState<ExtractedBrand | null>(null);

  const extractBrand = useMutation(api.brand.extractBrand);

  const handleExtract = async () => {
    setLoading(true);
    try {
      const result = await extractBrand({ url });
      if (result.success) {
        setBrand(result.brand);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="url"
        placeholder="https://your-saas.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleExtract} disabled={loading}>
        {loading ? 'Extracting...' : 'Extract My Brand'}
      </button>

      {brand && (
        <div>
          <img src={brand.logo} alt="Logo" />
          <div>Primary: {brand.primaryColor}</div>
          <div>Font: {brand.fontFamily}</div>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Pricing Consideration

### Firecrawl Pricing

| Plan | Price | Credits | Good For |
|------|-------|---------|----------|
| **Free** | $0 | 500 credits | Testing, small projects |
| **Hobby** | $19/mo | 5,000 credits | Startup, MVP |
| **Standard** | $49/mo | 100,000 credits | Growing business |
| **Scale** | $249/mo | 1M+ credits | Production |

### Credit Usage for OGSnap

| Action | Credits | Cost (Hobby) | Cost (Scale) |
|--------|---------|---------------|--------------|
| Brand extraction | 1/page | $0.004/page | $0.0003/page |
| Content monitoring | 1/page × pages | Variable | Variable |

**Recommendation:**
- Free tier: Test brand extraction
- Hobby ($19/mo): Up to 5,000 brand extractions/month
- Scale when: >50K extractions/month

---

## 5. Alternative: Custom Playwright Solution

If Firecrawl costs are a concern, we can build our own:

```typescript
// Custom brand extraction using Playwright
async function extractBrandWithPlaywright(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(url);
  
  // Wait for content to load
  await page.waitForLoadState('networkidle');
  
  // Extract logo
  const logo = await page.evaluate(() => {
    // Try various selectors
    const selectors = [
      'img[alt*="logo"]',
      '.logo img',
      'header img',
      'nav img',
      '[class*="logo"] img',
    ];
    
    for (const selector of selectors) {
      const img = document.querySelector(selector) as HTMLImageElement;
      if (img?.src) return img.src;
    }
    return null;
  });
  
  // Extract colors from computed styles
  const colors = await page.evaluate(() => {
    const body = document.body;
    const style = window.getComputedStyle(body);
    return {
      background: style.backgroundColor,
      color: style.color,
      primary: getPrimaryColor(), // Custom helper
    };
  });
  
  await browser.close();
  
  return { logo, ...colors };
}
```

**Pros:**
- Free (no API costs)
- More control
- Custom extraction logic

**Cons:**
- Infrastructure needed
- Slower
- Maintenance burden

---

## 6. Summary: Firecrawl Integration

| Feature | Use Firecrawl? | Alternative |
|---------|----------------|-------------|
| Magic Onboarding (brand extraction) | ✅ **Yes** | Custom Playwright |
| Auto-regeneration (content monitoring) | ✅ Yes | Custom cron + Playwright |
| Analytics (content analysis) | ✅ Yes | Basic metadata extraction |
| OG image rendering | ❌ No | Our Playwright service |

### Final Recommendation

1. **Magic Onboarding**: Use Firecrawl (fast, reliable, cheap)
2. **Content Monitoring**: Build custom with our Playwright service (reuse infrastructure)
3. **Analytics**: Basic extraction only (use meta tags)

### Cost Estimate

| Scenario | Monthly Cost |
|----------|-------------|
| 1,000 brand extractions/mo | $19 (Hobby) |
| 10,000 brand extractions/mo | $49 (Standard) |
| 100,000 brand extractions/mo | $249 (Scale) |

**Start with Free tier (500 credits) for testing, upgrade to Hobby ($19) at launch.**
