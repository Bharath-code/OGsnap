# OGSnap — Brand Identity
**Version:** 1.0

---

## Brand Essence

**What we are:** The OG image API built exclusively for JavaScript developers.  
**What we're not:** A marketing tool. A no-code platform. A Bannerbear clone.  
**Our attitude:** Quietly confident. We don't oversell. The product speaks.

---

## Name

**OGSnap**

- **OG** — Open Graph. Every developer knows what this means. No explanation needed.
- **Snap** — Instant. Fast. A snapshot. The satisfying click of something just working.
- Together: Instant Open Graph images. The name is the pitch.

**Domain:** ogsnap.dev  
(.dev TLD signals developer-first positioning. Not .com, not .io — .dev.)

**npm scope:** `@ogsnap`  
(Clean, memorable, professional. `@ogsnap/next` reads naturally.)

---

## Logo

### Concept
A stylized camera aperture / shutter combined with the `</>` code bracket motif. Clean, geometric, works at 16px favicon size and 512px social icon size.

### Logo Mark (Icon only)
- Geometric hexagon or rounded square as container
- Inner symbol: a simplified aperture shape with a subtle `{ }` reference
- Color: white symbol on brand-primary (#6366F1) background
- Works in: dark backgrounds, light backgrounds, monochrome

### Logo Wordmark
```
[icon] OGSnap
```
- Icon: 32px
- "OG" — weight 700, color #FAFAFA
- "Snap" — weight 400, color #6366F1
- Font: Geist

### Logo Don'ts
- Don't stretch or distort the logo
- Don't use on backgrounds with insufficient contrast
- Don't change the font
- Don't add effects (shadows, gradients on the wordmark)
- Don't use the icon without the wordmark in marketing contexts (brand is too new)

---

## Voice & Tone

### Personality
OGSnap speaks like a senior developer friend — someone who:
- Gets to the point fast (no fluff)
- Is honest about tradeoffs
- Doesn't talk down to you
- Is confident but not arrogant
- Occasionally dry humor, never forced

### Voice Attributes
| We are | We are not |
|--------|-----------|
| Precise | Vague |
| Confident | Arrogant |
| Direct | Blunt |
| Helpful | Patronizing |
| Technical | Jargon-y |
| Dry | Silly |

### Writing Examples

**Homepage hero:**
✅ "OG images in 3 lines. Works in every JS framework."  
❌ "Supercharge your social presence with AI-powered dynamic image generation!"

**Error message:**
✅ "Invalid API key. Keys start with `og_live_` or `og_test_`."  
❌ "Oops! Something went wrong. Please try again later."

**Plan upgrade prompt:**
✅ "Remove the watermark. $7/month."  
❌ "Unlock your full potential with OGSnap Hobby — the plan that helps developers like you shine!"

**Docs:**
✅ "Install the package. Set your API key. Done."  
❌ "Welcome to OGSnap! We're so excited to help you get started on your journey..."

**Email subject lines:**
✅ "Your API key is ready"  
✅ "You've used 80% of your render limit"  
✅ "Payment confirmed — watermark removed"  
❌ "Welcome aboard, superstar! 🚀🎉"

---

## Taglines

**Primary (homepage hero):**
> OG images in 3 lines. Every JS framework.

**Secondary options:**
> Stop building your own OG image pipeline.  
> The OG image API developers actually want.  
> Ship OG images in minutes, not hours.

---

## Brand Applications

### Watermark (Free Tier)
- Text: `ogsnap.dev`
- Style: Geist font, 14px, white, 50% opacity
- Position: bottom-right, 20px padding
- Background: none (text only, semi-transparent)
- Purpose: Passive brand exposure + conversion pressure

Design the watermark to be: tasteful enough that developers don't immediately feel embarrassed, visible enough that anyone who sees the image can read it, and memorable enough that curious developers Google it.

### npm Package READMEs
Every package README is marketing. It should:
- Show the install command in the first 3 lines
- Show a working code example in the first 10 lines
- Include a real output GIF/image
- Link to the dashboard to get an API key
- Be under 200 lines total — developers don't read long READMEs

### GitHub Repository
- Star count is social proof — make the repo public immediately
- Write a compelling repo description: "OG image API for Next.js, Astro, Remix, SvelteKit, TanStack. 3-line install."
- Add topics: `og-image`, `nextjs`, `astro`, `sveltekit`, `remix`, `tanstack`, `typescript`, `api`
- Respond to issues within 24 hours — especially in the first month

### Social Presence

**Twitter/X:**
Handle: `@ogsnap` (check availability)  
Bio: "OG images in 3 lines. Every JS framework. Built by @yourusername"  
Strategy: Build in public. Post weekly MRR updates. Post technical findings. Be a person, not a brand.

Post format that works for developer tools:
- "I built X because Y was painful. Here's how it works: [thread]"
- "After X users, here's what I learned about [technical problem]"
- Week N revenue screenshots (builds trust + attracts users)

---

## Email Templates

### Welcome Email (sent immediately on signup)
```
Subject: Your OGSnap API key is ready

Hey,

Your API key is ready. Here's how to get your first OG image:

npm install @ogsnap/next

// app/[...slug]/opengraph-image.ts
import { generateOG } from '@ogsnap/next'
export const { GET } = generateOG({ apiKey: 'og_live_YOUR_KEY' })

Your key: og_live_xxxxxxxxxxxxxxxx
Dashboard: https://ogsnap.dev/dashboard

That's it. Takes about 3 minutes.

If you run into anything, just reply to this email.

— [Your name]
(I built OGSnap and I read every reply)
```

Note the "I built OGSnap and I read every reply" line. This is critical early on. People respond to humans, not brands. Personal founder emails convert 3x better than corporate templates.

### 80% Usage Warning Email
```
Subject: You've used 80% of your render limit

Hey,

Quick heads up — you've used 400 of your 500 free renders this month.

When you hit 500, new renders will show the watermark again.

Upgrade to Hobby ($7/month) for 2,000 renders and no watermark:
https://ogsnap.dev/dashboard/billing

— [Your name]
```

### Cancellation Email (sent when subscription cancelled)
```
Subject: You cancelled — one question

Hey,

Your OGSnap subscription has been cancelled. No hard feelings.

I'd genuinely like to know why so I can make it better.
Was it the price? Missing features? Found something else?

Just reply with one sentence — it really helps.

— [Your name]
```

---

## What Good Looks Like

When OGSnap's brand is working, a developer who encounters it for the first time should think:

*"This looks like it was built by a developer who actually uses it. Simple, no BS, probably just works."*

That's the goal. Not "wow, so polished." Not "what a cool brand." Just immediate trust that this is a real tool that does what it says.

The best developer tools don't have a "brand" in the traditional sense. They have a reputation. Build the reputation first. The brand follows.
