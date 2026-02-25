# OGSnap — Execution Plan
**Total Timeline to Launch:** 6 weeks  
**Hours/week available:** 15  
**Total hours budget:** ~90 hours

---

## Guiding Principle

Ship ugly. Ship fast. Get feedback. Fix what matters. 
Every day you spend perfecting something before launch is a day you don't know if anyone cares. The market is the only validator that matters.

**The Moat Focus:** Every feature we build must increase switching costs or create network effects. Pure feature development without defensibility = wasted time.

---

## Week 1 — Foundation (15 hours)

**Goal:** Working render API locally. Not deployed. Not pretty. Just working.

| Task | Hours | Done? |
|------|-------|-------|
| Set up monorepo (pnpm + turbo) | 1h | ☐ |
| Set up Convex project | 0.5h | ☐ |
| Define Convex schema (`users`, `apiKeys`, `renderLogs`, etc.) | 1h | ☐ |
| Playwright browser renderer (deploy to Vercel/Railway as microservice) | 3h | ☐ |
| First HTML template (card layout) | 2h | ☐ |
| Core render Convex Action (`api/render:generateImage`) | 2h | ☐ |
| Multi-platform output support (OG + Twitter + LinkedIn + Slack + Discord) | 3h | ☐ |
| Basic usage tracking | 2h | ☐ |

**End of Week 1 milestone:** Calling the Convex Action returns a PNG image. That's it. That's the milestone.

---

## Week 2 — Auth + Brand Kit + Magic Onboarding (15 hours)

**Goal:** Real users can sign up and get an API key. Plus the "wow factor" feature.

| Task | Hours | Done? |
|------|-------|-------|
| Setup Clerk Auth + Convex Auth integration | 1.5h | ☐ |
| API key generation + hashed storage in Convex | 2h | ☐ |
| Auth checks inside Convex HTTP endpoints | 1h | ☐ |
| Brand kit CRUD (Convex Queries/Mutations) | 1.5h | ☐ |
| R2 setup + logo upload endpoint | 2h | ☐ |
| Brand kit applied to renderer | 2h | ☐ |
| Watermark injection (Sharp) for free tier | 2h | ☐ |
| Usage counter increment + limit check (Convex Mutation) | 1h | ☐ |
| **Magic Onboarding: AI brand extraction from URL** | 3h | ☐ |

**End of Week 2 milestone:** Sign up via Clerk → get API key → trigger Convex HTTP Endpoint → render image with brand colors. Watermark appears if no paid plan. **Bonus: User pastes URL, gets auto-generated images in 10 seconds.**

---

## Week 3 — Dashboard + Billing (15 hours)

**Goal:** Someone can sign up, upgrade, and manage their account without touching you.

| Task | Hours | Done? |
|------|-------|-------|
| Next.js dashboard scaffold + auth pages | 3h | ☐ |
| Dashboard overview page (usage meter, recent renders) | 2h | ☐ |
| API key management UI | 1.5h | ☐ |
| Brand kit editor UI (logo + color + font) | 3h | ☐ |
| Live preview in brand kit editor | 1.5h | ☐ |
| DodoPayments products + prices setup | 0.5h | ☐ |
| DodoPayments Checkout integration | 2h | ☐ |
| DodoPayments webhook handler (subscription events) | 1.5h | ☐ |

**End of Week 3 milestone:** Full billing flow works end-to-end. Test a real payment in DodoPayments test mode.

---

## Week 4 — SDKs + Deployment (15 hours)

**Goal:** npm packages published, everything deployed, public URL works.

| Task | Hours | Done? |
|------|-------|-------|
| `@ogsnap/core` package (types + base client) | 2h | ☐ |
| `@ogsnap/next` SDK (App Router + Pages Router) | 3h | ☐ |
| `@ogsnap/astro` SDK | 2h | ☐ |
| README files for both SDKs (excellent DX docs) | 2h | ☐ |
| Deploy Dashboard to Vercel (Convex deploys instantly) | 0.5h | ☐ |
| Deploy Playwright renderer microservice to Railway/Vercel | 1h | ☐ |
| Set up Cloudflare DNS + CDN | 1h | ☐ |
| Switch DodoPayments to live mode | 0.5h | ☐ |
| UptimeRobot + Sentry setup | 0.5h | ☐ |
| End-to-end smoke test (real URL → real image) | 1h | ☐ |
| Rate limiting on Convex HTTP endpoints | 1h | ☐ |

**End of Week 4 milestone:** `npm install @ogsnap/next` works from a real Next.js project. Image renders. Shows up in dashboard.

---

## Week 5 — Marketing Site + Content (10 hours)

**Goal:** Someone who discovers OGSnap can understand it and sign up in under 60 seconds.

| Task | Hours | Done? |
|------|-------|-------|
| Homepage hero with live demo (paste URL → see OG image) | 3h | ☐ |
| Pricing section | 1h | ☐ |
| Framework logos section (Next.js, Astro, etc.) | 0.5h | ☐ |
| Code snippet preview for each framework | 1h | ☐ |
| Quickstart docs page (one page, not a full docs site) | 1.5h | ☐ |
| Privacy policy + Terms (use termly.io generator) | 0.5h | ☐ |
| OGSnap's own OG image (meta) | 0.5h | ☐ |
| SEO meta tags on all pages | 0.5h | ☐ |
| Test on mobile (dashboard + homepage) | 0.5h | ☐ |
| Write Show HN post | 0.5h | ☐ |

**End of Week 5 milestone:** Show 3 non-developer friends the homepage. They should understand what it does in 10 seconds.

---

## Week 6 — Launch Week (10 hours)

**Goal:** Real users. Real feedback. Maybe first money.

| Task | Hours | Done? |
|------|-------|-------|
| Post on Show HN (Tuesday morning, 9am ET) | 0.5h | ☐ |
| Post on r/nextjs, r/webdev, r/SideProject | 1h | ☐ |
| DM 20 developers with open-source projects missing OG images | 2h | ☐ |
| Post on Twitter/X with demo GIF | 0.5h | ☐ |
| Respond to every single comment and reply | 3h | ☐ |
| Collect feedback from first 10 signups (email them personally) | 1h | ☐ |
| Fix the 3 most-reported issues immediately | 2h | ☐ |

**End of Week 6 milestone:** 50 signups. 3-5 paying customers. First real feedback collected.

---

## Month 2 — Growth & v1.1

**Week 7-8:**
- Ship `@ogsnap/svelte` SDK
- Ship `@ogsnap/remix` SDK
- Write first SEO blog post: "OG images in Astro — complete guide"
- Post in SvelteKit GitHub discussion thread
- Email JavaScript Weekly curator
- **Launch referral program**
- **Create Discord community (target: 100 members)**

**Week 9-10:**
- Ship `@ogsnap/nuxt` SDK (if demand)
- Write second SEO blog post: "Vercel OG vs OGSnap — which should you use"
- Product Hunt launch preparation
- Add analytics dashboard (v1.1)
- **Reach out to framework maintainers for official partnerships**

**Month 2 target:** 40 paying customers, $800 MRR

---

## Month 3 — Compounding

- Product Hunt launch (with Magic Onboarding as killer feature)
- Add 5 templates (v1.1)
- **Launch template marketplace beta**
- **Announce first framework partnerships (Astro, Svelte)**
- Start building in public on Twitter (weekly MRR updates)
- Reach out to 3 developer YouTubers for tutorial collaboration
- **Launch "Built with OGSnap" program**
- **Ship Enterprise tier (white-label, SLA, unlimited)**
- Target: 100+ paying customers, $2,000+ MRR

---

## Weekly Rhythm

**Every week, no exceptions:**
- Monday: Plan the week's tasks. One hour max.
- Tuesday-Friday: Build. No context switching.
- Saturday: Write one tweet or post about what you built. Build in public.
- Sunday: Check metrics, respond to support, plan next week.

**Monthly:**
- Review churn. Email every customer who cancelled and ask why.
- Review top support questions. Turn 3 of them into docs.
- Check npm download trends. Double down on what's growing.

---

## When To Quit (Know This In Advance)

If after 3 months you have fewer than 20 paying customers, the product has a problem. Not a distribution problem — a product problem. At that point: interview 10 free users about why they didn't upgrade, and either fix the conversion problem or pivot the product. Don't just keep building features hoping something sticks.

The signal to keep going: any stranger pays you money without you asking them personally. That's the moment the business is real.

---

## Moat Building Timeline (Beyond Revenue)

### Month 4-6: Integration Moat
- Support 10+ frameworks (add Vue, Nuxt, Solid, Qwik)
- Official framework partnerships announced
- "OGSnap Certified" partner program launched

### Month 7-9: Community Moat
- Discord community: 500+ members
- Template marketplace live with premium templates
- "Built with OGSnap" badges on 100+ customer sites
- First OGSnap virtual event

### Month 10-12: Platform Moat
- Open-source OGSnap Engine (core rendering)
- Create OGSnap Standard (open spec for social images)
- Annual "State of Social Images" report published
- Series A preparation
