# OGSnap — Design System
**Philosophy:** Clean, developer-native, confident. No gradients on gradients. No emoji overload. Just precision.

---

## Design Principles

**1. Developer-first aesthetics** — Developers distrust overly polished "marketing" UIs. Our design should feel like it was built by someone who codes, not a Dribbble portfolio. Think Linear, Vercel, Railway — not Mailchimp.

**2. Speed over beauty** — Every interaction should feel instant. Loading states are not failures, they're opportunities to communicate. But fast > pretty always.

**3. Information density** — Developers are comfortable reading dense UIs. Don't over-space things trying to look "premium." Show data clearly without burying it in whitespace.

**4. Dark mode first** — Our primary target user codes in dark mode. Build dark first, light second.

---

## Color System

### Brand Colors
```css
/* Primary — Electric Indigo */
--brand-primary: #6366F1;        /* Main CTA, links, focus rings */
--brand-primary-hover: #4F46E5;  /* Hover state */
--brand-primary-light: #EEF2FF;  /* Light backgrounds, badges */

/* Accent — Emerald (success, metrics going up) */
--brand-accent: #10B981;

/* Danger */
--brand-danger: #EF4444;

/* Warning */
--brand-warning: #F59E0B;
```

### Dark Mode Palette (Primary)
```css
--bg-base: #0A0A0B;          /* Page background */
--bg-surface: #111113;       /* Cards, panels */
--bg-elevated: #1A1A1E;      /* Dropdowns, modals, hover states */
--bg-border: #2A2A2E;        /* Borders, dividers */

--text-primary: #FAFAFA;     /* Headlines, important text */
--text-secondary: #A1A1AA;   /* Body text, descriptions */
--text-muted: #52525B;       /* Timestamps, labels, placeholders */

--ring-focus: #6366F1;       /* Focus rings on inputs */
```

### Light Mode Palette
```css
--bg-base: #FFFFFF;
--bg-surface: #FAFAFA;
--bg-elevated: #F4F4F5;
--bg-border: #E4E4E7;

--text-primary: #09090B;
--text-secondary: #52525B;
--text-muted: #A1A1AA;
```

### Semantic Colors
```css
--color-success: #10B981;
--color-error: #EF4444;
--color-warning: #F59E0B;
--color-info: #3B82F6;
```

---

## Typography

### Font Stack
```css
/* UI Font — Geist (Vercel's open source font) */
--font-sans: 'Geist', 'Inter', system-ui, -apple-system, sans-serif;

/* Mono — Code snippets, API keys, technical values */
--font-mono: 'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace;
```

Why Geist? It's developer-native, free, open-source, and strongly associated with modern dev tooling. It signals "we're like Vercel" at a subconscious level.

### Type Scale
```css
--text-xs: 0.75rem;     /* 12px — timestamps, badges */
--text-sm: 0.875rem;    /* 14px — body, descriptions, table data */
--text-base: 1rem;      /* 16px — default body */
--text-lg: 1.125rem;    /* 18px — section headers */
--text-xl: 1.25rem;     /* 20px — card titles */
--text-2xl: 1.5rem;     /* 24px — page titles */
--text-3xl: 1.875rem;   /* 30px — dashboard H1 */
--text-4xl: 2.25rem;    /* 36px — marketing hero subtitle */
--text-5xl: 3rem;       /* 48px — marketing hero headline */
```

### Type Weights
- **400 Regular** — Body text, descriptions
- **500 Medium** — Labels, table headers, nav items
- **600 Semibold** — Card titles, important values
- **700 Bold** — Headlines, CTAs, emphasis

---

## Spacing System

Base unit: **4px**

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

**Component-specific spacing:**
- Card padding: `24px`
- Section padding: `48px 0`
- Dashboard sidebar width: `240px`
- Max content width: `1200px`
- Dashboard max content: `900px`

---

## Border Radius

```css
--radius-sm: 4px;     /* Badges, small chips */
--radius-md: 8px;     /* Inputs, buttons */
--radius-lg: 12px;    /* Cards, panels */
--radius-xl: 16px;    /* Modals, large containers */
--radius-full: 9999px; /* Pills, avatars */
```

---

## Component Specifications

### Buttons

**Primary Button**
```
Background: #6366F1
Hover: #4F46E5
Text: #FFFFFF (semibold, 14px)
Padding: 10px 16px
Border radius: 8px
Transition: background 150ms ease
```

**Secondary Button**
```
Background: transparent
Border: 1px solid #2A2A2E
Hover background: #1A1A1E
Text: #FAFAFA (medium, 14px)
```

**Danger Button**
```
Background: transparent
Border: 1px solid #EF4444
Text: #EF4444
Hover background: rgba(239, 68, 68, 0.1)
```

### Input Fields
```
Background: #111113
Border: 1px solid #2A2A2E
Border (focus): 1px solid #6366F1
Ring (focus): 0 0 0 3px rgba(99, 102, 241, 0.15)
Text: #FAFAFA (14px)
Placeholder: #52525B
Padding: 10px 12px
Border radius: 8px
Font family: Geist (sans for text, mono for API keys)
```

### Cards
```
Background: #111113
Border: 1px solid #2A2A2E
Border radius: 12px
Padding: 24px
Box shadow: none (flat is more developer-appropriate)
```

### Usage Meter (Key Component)
```
Track: #1A1A1E, height 8px, border-radius 999px
Fill: gradient from #6366F1 to #8B5CF6
Fill (warning 80%+): #F59E0B
Fill (limit 100%): #EF4444
Label: "X,XXX / X,XXX renders" in text-sm text-secondary
```

### Plan Badges
```
Free:    background #1A1A1E  text #A1A1AA  border #2A2A2E
Hobby:   background #1E1E2E  text #818CF8  border #3730A3
Starter: background #0D2618  text #34D399  border #065F46
Pro:     background #1C1917  text #FBBF24  border #78350F
Scale:   background #1A0A2E  text #C084FC  border #7E22CE
```

### Code Snippets (Critical — this is marketing)
```
Background: #0D0D0F
Border: 1px solid #2A2A2E
Border radius: 12px
Padding: 20px 24px
Font: Geist Mono, 14px
Line height: 1.7
Syntax highlighting: use Shiki with 'github-dark' theme
Copy button: top-right corner, appears on hover
Language badge: top-left corner in text-muted
```

---

## Icons

Use **Lucide Icons** exclusively. It's the shadcn/ui default, consistent style, tree-shakeable.

Key icons used frequently:
- `Key` — API keys
- `Zap` — renders / performance
- `BarChart2` — analytics
- `Palette` — brand kit
- `Copy` — copy to clipboard
- `CheckCircle` — success states
- `AlertCircle` — errors/warnings
- `ExternalLink` — external URLs
- `Trash2` — delete actions
- `RefreshCw` — regenerate/refresh
- `Eye / EyeOff` — show/hide API key

---

## Dashboard Layout

```
┌──────────────────────────────────────────────────────┐
│  SIDEBAR (240px, fixed)           HEADER (full width) │
│  ┌────────────┐  ┌──────────────────────────────────┐ │
│  │ OGSnap     │  │ Page title        [User menu]    │ │
│  │ logo       │  └──────────────────────────────────┘ │
│  ├────────────┤                                        │
│  │ Overview   │  CONTENT AREA (max-width: 900px)      │
│  │ API Keys   │  ┌──────────────────────────────────┐ │
│  │ Brand Kit  │  │                                  │ │
│  │ Renders    │  │                                  │ │
│  │ Analytics  │  │                                  │ │
│  │ Billing    │  │                                  │ │
│  ├────────────┤  │                                  │ │
│  │ Docs ↗    │  └──────────────────────────────────┘ │
│  │ Support    │                                        │
│  └────────────┘                                        │
└──────────────────────────────────────────────────────┘
```

---

## Marketing Site Layout

### Hero Section
- Full width, dark background (#0A0A0B)
- Badge: "Now supporting 5 frameworks" in brand-primary-light
- H1: 56px bold, white, centered, max 10 words
- Subtitle: 20px, text-secondary, max 20 words
- Two CTAs: Primary "Get API Key free" + Secondary "View docs"
- Live demo below CTAs: URL input → shows real OG image result
- Framework logos strip: Next.js, Astro, Remix, SvelteKit, TanStack

### Code Section
- Dark card showing 3-line install for each framework
- Tab switcher: Next.js | Astro | Remix | SvelteKit | TanStack
- Animated typing effect on first load (subtle, not distracting)

### Pricing Section
- 4 cards in a row: Hobby | Starter | Pro | Scale
- Starter card slightly elevated with "Most Popular" badge
- All prices show monthly, with annual toggle (-20%)

---

## Micro-interactions

- **Copy button:** Click → icon changes to `Check` for 2 seconds → back to `Copy`
- **API key reveal:** Click `Eye` icon → key blurs out → click again to hide
- **Usage meter:** Animate fill on page load (0% → actual value, 800ms ease-out)
- **Plan upgrade:** Confetti burst (canvas-confetti, 1 second) after successful payment
- **Render complete:** Toast notification bottom-right with thumbnail preview
- **Error states:** Shake animation on form submission failure (CSS keyframes)

---

## OG Image Templates (What You're Selling)

Your OG images need to look better than what developers would build themselves. Here are the design specs for the default template:

### Default Card Template (1200×630px)
```
Background: user's background_color
Left padding: 80px
Top padding: 80px

Logo: user's logo, max 160px wide, max 48px tall, top-left

Title: 
  font: user's chosen font
  size: 56-72px (scales down for long titles)
  weight: 700
  color: user's primary_color
  max 2 lines, then truncate
  position: center-left, vertically centered

Description:
  font: same as title
  size: 24px
  weight: 400  
  color: primary_color at 70% opacity
  max 2 lines
  margin-top: 16px from title

Bottom bar:
  height: 8px
  background: gradient from primary_color to primary_color + 30deg hue rotation
  position: absolute, bottom: 0, full width

Domain:
  bottom-left: 32px from bottom, 80px from left
  text: yourdomain.com
  size: 18px
  color: primary_color at 50% opacity
```

---

## Tailwind Config

```javascript
// tailwind.config.ts
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366F1',
          hover: '#4F46E5',
          light: '#EEF2FF',
        },
        surface: {
          base: '#0A0A0B',
          card: '#111113',
          elevated: '#1A1A1E',
          border: '#2A2A2E',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      }
    }
  }
}
```
