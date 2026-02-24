# OGSnap — Landing Page UX Specification
## Complete UX breakdown for maximum conversion

---

## 1. Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  NAVIGATION (sticky)                                                    │
│  Logo | Docs | Pricing | Discord | [Sign In] | [Get API Key - CTA]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  HERO (above fold - most critical)                                     │
│  - Value proposition                                                    │
│  - Interactive live demo                                               │
│  - Primary CTA                                                          │
│  - Secondary CTA                                                        │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SOCIAL PROOF                                                           │
│  - Usage stats                                                          │
│  - Rating                                                               │
│  - Company logos                                                        │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PROBLEM/SOLUTION                                                       │
│  - Problem statement                                                    │
│  - Solution preview                                                    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CODE PREVIEW                                                           │
│  - Tabbed by framework                                                 │
│  - One-click copy                                                       │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FEATURES                                                               │
│  - Key benefits grid                                                   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PRICING                                                                │
│  - 3-4 tier cards                                                      │
│  - Toggle (monthly/annual)                                             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  TESTIMONIALS                                                           │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FAQ                                                                    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FOOTER                                                                 │
│  - Links, social, legal                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Hero Section (Critical)

### UX Goals
1. Communicate value in <3 seconds
2. Demonstrate product works instantly
3. Get user to try demo or signup

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ✨ Now supporting 5 frameworks                                       │
│                                                                         │
│         OG images in 3 lines.                                           │
│         Every JS framework.                                            │
│                                                                         │
│      Stop building your own OG pipeline. Ship in minutes.              │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐      │
│   │  Try it now →  [                        ]  [Generate]      │      │
│   └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
│        [Get API Key — Free]              [View Documentation]         │
│                                                                         │
│                    ┌─────────────────────┐                             │
│                    │                     │                             │
│                    │   YOUR OG IMAGE    │                             │
│                    │                     │                             │
│                    │   [Logo]           │                             │
│                    │   Title Here       │                             │
│                    │   yoursite.com    │                             │
│                    │                     │                             │
│                    └─────────────────────┘                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Decisions

| Element | Choice | Rationale |
|---------|--------|-----------|
| Badge | "5 frameworks" | Immediate differentiation |
| Headline | Short, punchy | Scannable, memorable |
| Subheadline | Benefit-focused | Explains value |
| Input | Pre-filled with placeholder | Reduces friction |
| CTA buttons | Primary + Secondary | Two choices, no paralysis |
| Demo preview | Right side | Visual proof |

### Live Demo UX

```
INTERACTION FLOW:

1. User lands → Input shows placeholder: "yoursite.com"
2. User clicks input → Placeholder clears, cursor active
3. User types/pastes URL → Real-time validation
4. User clicks "Generate" → 
   - Button shows spinner
   - Preview shows "Generating..." skeleton
   - After 1-2s: Image appears with subtle scale animation
5. User sees result → Aha moment!
6. CTA buttons become more prominent

VALIDATION:
- Invalid URL → Show error, suggest format
- Too long → Truncate, show warning
- Special chars → Auto-encode
```

### Above-the-Fold Psychology

- **Pattern interrupt**: The live demo is interactive, not static
- **Instant value**: User sees result before signup
- **Commitment**: Typing a URL = small commitment = higher conversion
- **Sensory**: Visual OG image = tangible result

---

## 3. Social Proof Section

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   "The easiest way to add OG images to any JavaScript app."           │
│                                                                         │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│   │ ○ ○ ○    │ │  ★ 4.9   │ │ 2.4K     │ │ 99.9%    │                │
│   │ GitHub    │ │ rating   │ │ npm/wk   │ │ uptime   │                │
│   │ stars     │ │          │ │          │ │          │                │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘                │
│                                                                         │
│   Used by developers at                                                 │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│   │COMPANY│ │COMPANY│ │COMPANY│ │COMPANY│ │COMPANY│ │...   │              │
│   └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              │
│   (Logos in grayscale, 40% opacity)                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Decisions

| Element | Choice | Rationale |
|---------|--------|-----------|
| Quote | From real user | Authentic social proof |
| Stats | 4 key metrics | Multiple proof points |
| Logos | Grayscale + subtle | Professional, not distracting |
| Hover | Logos become colored | Interactive, shows "clickable" |

---

## 4. Code Preview Section

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│         Three lines. That's it.                                        │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │  ┌─ Tabs ───────────────────────────────────────────┐     │       │
│   │  │ [next.js] [astro] [svelte] [remix] [vue]         │     │       │
│   │  └──────────────────────────────────────────────────┘     │       │
│   │                                                        │       │
│   │  1  │ npm install @ogsnap/next                       │       │
│   │  2  │                                                │       │
│   │  3  │ // app/blog/[slug]/opengraph-image.ts       │       │
│   │  4  │ import { generateOG } from '@ogsnap/next'     │       │
│   │  5  │                                                │       │
│   │  6  │ export const { GET } = generateOG({          │       │
│   │  7  │   apiKey: process.env.OGSNAP_API_KEY        │       │
│   │  8  │ })                                            │       │
│   │  9  │                                                │       │
│   │     └────────────────────────────────────────────────┘       │
│   │                                                        │       │
│   │                              [Copy]  ✓ Copied!              │       │
│   │                                                        │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
│          Auto-reads your page metadata. No configuration needed.      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Decisions

| Element | Choice | Rationale |
|---------|--------|-----------|
| Tabs | Framework selector | Shows multi-framework support |
| Numbered lines | Shows simplicity | "Only 3 lines!" |
| Syntax highlighting | GitHub Dark theme | Familiar, readable |
| Copy button | One-click | Frictionless |
| Subtext | Reassurance | "No config needed" |

### Code Tab Interaction

```
1. Page load → Auto-detect user's framework from browser
   → Highlight that tab
2. User clicks tab → Switch code instantly (no load)
3. User clicks copy → Icon changes to checkmark for 2s
4. User hovers code → Subtle highlight
```

---

## 5. Features Grid

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│          Everything you need. Nothing you don't.                        │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │     ⚡            │  │     🎨           │  │     🔄           │     │
│  │   Lightning      │  │   Beautiful     │  │   Auto-          │     │
│  │   Fast           │  │   Templates     │  │   Updating       │     │
│  │                  │  │                  │  │                  │     │
│  │  CDN-cached in  │  │  5 stunning     │  │  Connect your    │     │
│  │  under 50ms.    │  │  templates      │  │  blog. We watch  │     │
│  │                  │  │  included.      │  │  for changes.   │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │     🔒            │  │     📊           │  │     🌍           │     │
│  │   TypeScript     │  │   Analytics      │  │   Multi-         │     │
│  │   First          │  │   Built-in       │  │   Platform       │     │
│  │                  │  │                  │  │                  │     │
│  │  Full type       │  │  See which      │  │  OG, Twitter,    │     │
│  │  safety. No      │  │  images get     │  │  LinkedIn, Slack │     │
│  │  guessing.      │  │  the most       │  │  from one API.  │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Decisions

| Element | Choice | Rationale |
|---------|--------|-----------|
| Grid | 3 columns | Balanced, scannable |
| Icons | Lucide, consistent | Visual anchors |
| Headlines | Short, benefit | Quick scan |
| Descriptions | 1-2 lines | Don't overwhelm |

---

## 6. Pricing Section

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│           Simple pricing. No hidden fees.                               │
│                                                                         │
│                    [Monthly]  ○   [Annual -20%] ●                      │
│                                                                         │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│   │  FREE     │  │  HOBBY    │  │   PRO     │  │  SCALE    │          │
│   │           │  │  ★ Popular│  │           │  │           │          │
│   │   $0      │  │   $9      │  │   $29     │  │   $99     │          │
│   │  /month   │  │  /month   │  │  /month   │  │  /month   │          │
│   │           │  │  $7/yr    │  │ $23/yr    │  │ $79/yr    │          │
│   ├───────────┤  ├───────────┤  ├───────────┤  ├───────────┤          │
│   │100 renders│  │1,000      │  │5,000      │  │25,000     │          │
│   │per month │  │renders    │  │renders    │  │renders    │          │
│   │           │  │           │  │           │  │           │          │
│   │⚠️ watermark│  │✅ No      │  │✅ No      │  │✅ No      │          │
│   │           │  │watermark  │  │watermark  │  │watermark  │          │
│   │           │  │           │  │           │  │           │          │
│   │ 1 API key │  │ 3 keys    │  │10 keys    │  │Unlimited  │          │
│   │           │  │           │  │           │  │           │          │
│   │Community  │  │Priority   │  │Dedicated  │  │SLA        │          │
│   │support   │  │support    │  │support    │  │Support    │          │
│   │           │  │           │  │Custom     │  │White-     │          │
│   │           │  │           │  │fonts      │  │label      │          │
│   ├───────────┤  ├───────────┤  ├───────────┤  ├───────────┤          │
│   │           │  │           │  │           │  │           │          │
│   │[Get Start]│  │[Subscribe]│  │[Subscribe]│  │[Contact]  │          │
│   │           │  │           │  │           │  │           │          │
│   └───────────┘  └───────────┘  └───────────┘  └───────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Decisions

| Element | Choice | Rationale |
|---------|--------|-----------|
| Toggle | Annual discounted | Anchor monthly price |
| Popular badge | Hobby tier | Guide choice |
| Comparison | Aligned features | Easy scanning |
| CTA | Primary on paid tiers | Encourage upgrade |
| Enterprise | Contact form | Not self-serve |

### Pricing Psychology

- **Anchoring**: Show annual discount makes monthly seem expensive
- **Default effect**: Pre-select annual (more revenue)
- **Popular choice**: Highlighted card draws attention
- **Graduation**: Clear path from free → hobby → pro
- **Enterprise**: Not everyone needs it, but knowing it's there builds trust

---

## 7. FAQ Section

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FAQ                                           │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │ How is OGSnap different from Vercel OG?                 │       │
│   │                                         ▼                 │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │ Can I use my own fonts and colors?                        │       │
│   │                                         ▼                 │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │ What if I need more than 25,000 renders?                    │       │
│   │                                         ▼                 │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                         │
│   ...                                                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Decisions

| Element | Choice | Rationale |
|---------|--------|-----------|
| Accordion | Expand/collapse | Saves space |
| Search | Optional | For long FAQs |
| Categories | Optional | If many questions |

---

## 8. Footer

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│   OGSnap                    Links                      Social           │
│   ──────────────            ───────────                ────────          │
│   The OG image API         Docs                       Twitter          │
│   for JavaScript          Pricing                     GitHub           │
│   developers.             Discord                     Discord          │
│                            Blog                                           │
│   © 2026 OGSnap           Support                                     │
│   All rights reserved.    Status                                     │
│                            Terms                                      │
│                            Privacy                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Mobile Responsiveness

### Hero (Mobile)

```
┌─────────────────────┐
│ ◉ ◉ ◉ ─ □ ✕       │
├─────────────────────┤
│  🔷 OGSnap   [≡]   │
│                     │
│  OG images in      │
│  3 lines.          │
│  Every JS          │
│  framework.        │
│                     │
│  ┌───────────────┐ │
│  │ yoursite.com →│ │
│  └───────────────┘ │
│                     │
│  ┌───────────────┐ │
│  │  [Your OG]    │ │
│  └───────────────┘ │
│                     │
│  [Get API Key]     │
│  [View Docs]       │
│                     │
│  next.js astro... │
└─────────────────────┘
```

### Mobile UX Adaptations

| Section | Desktop | Mobile |
|---------|--------|--------|
| Navigation | Top nav | Hamburger + bottom bar |
| Hero | Side-by-side demo | Stacked |
| Code | Full width | Horizontal scroll |
| Features | 3-col grid | 1-col stack |
| Pricing | 4-col | 1-col stack, scrollable |
| FAQ | Full width | Accordion |

---

## 10. Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Cumulative Layout Shift | < 0.1 |
| Page Weight | < 500KB |

---

## 11. Conversion Optimization Checklist

Before launch, verify:

- [ ] Hero demo works on mobile
- [ ] All CTAs are above fold
- [ ] Pricing toggle defaults to annual
- [ ] Popular badge is visible on Hobby
- [ ] Code copy button works
- [ ] All external links open in new tabs
- [ ] 404 page exists
- [ ] Loading states for all async actions
- [ ] Error states for all failure modes
- [ ] Analytics tracking on all CTAs

---

*This specification should be used alongside wireframes (13-WIREFRAMES.md) and UX flows (12-UX-FLOW.md) for complete implementation.*
