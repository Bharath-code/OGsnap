# OGSnap — Tech Stack Brainstorm (CTO Review)
**Status:** Archived (Pre-Consolidation Alternatives)  
**Superseded By:** `00-V1-DOC-CONSOLIDATION.md` and `03-TECH-STACK-ARCHITECTURE.md`

**Date:** February 2026  
**Reviewer:** Veteran CTO Perspective  
**Context:** Solo developer, India-based, 10-20hrs/week available

---

## 1. Backend Framework: Fastify vs Hono + Bun

**Clarification:** Fastify is Node.js (not Python). You're thinking of FastAPI (Python).

| Aspect | Fastify + Node | Hono + Bun |
|--------|---------------|------------|
| Performance | Fast | Faster (Bun is 3-4x Node) |
| Cold start | ~100ms | ~5ms |
| Deployment | Railway/Render | Railway, Cloudflare Workers, Vercel |
| Ecosystem | Mature, battle-tested | Growing, some npm package issues |
| TypeScript | Excellent | Excellent |

**Decision:** Stay with **Fastify + Node.js** for MVP
- More examples and tutorials available
- Easier debugging for solo dev
- Can migrate to Hono later if edge deployment needed
- Bun is still relatively young — some edge cases with npm packages

---

## 2. Database: Supabase vs Convex

### Convex Pros
- All-in-one: DB + Auth + Realtime + Functions
- TypeScript-first, incredible DX
- No ORM needed
- Vercel-backed, well-funded

### Convex Cons
- **Not self-hostable** — vendor lock-in
- **Pricing spikes at scale** — reads/writes add up
- **No Webhooks at hobby tier**

### Supabase Pros
- SQL is universal — you own your data
- Self-host option (never lock-in)
- Row Level Security (RLS) is powerful
- Works with Prisma/Drizzle ORM

### Decision: **Supabase** is the right choice

For a solo dev building a SaaS product, you want exit options. Convex makes sense for Vercel-native apps, not standalone products.

---

## 3. Payments: Stripe Alternatives for India

Stripe is not available in India. Options:

| Provider | Pros | Cons |
|----------|------|------|
| **Razorpay** | India's default, excellent docs, GST compliant | India-focused only |
| **DodoPayments** | Stripe-like API, India-focused | Newer, less community support |
| **Paddle** | Global, handles tax/VAT | More expensive |

**Decision:** Start with **Razorpay** (default choice) or **DodoPayments**
- Both support checkout + subscriptions
- Razorpay has better local support in India
- Both handle Indian tax requirements

---

## 4. Hosting: Railway vs VPS vs Cloud

### Cost/Maintenance Comparison

| Option | Monthly Cost | Maintenance | Scalability | Pain Level |
|--------|-------------|-------------|-------------|------------|
| Vercel (frontend) | Free | None | Auto | 0 |
| Railway | $5-20 | Low | Moderate | 1 |
| DigitalOcean Droplet | $5-20 | Medium | Manual | 3 |
| AWS/GCP | $50+ | High | Infinite | 10 |

### Decision: Phase-Based Approach

**Phase 1 (MVP → $1K MRR):**
- Dashboard: **Vercel** (free)
- API + Workers: **Railway** ($5-20/mo)
- Database: **Supabase** (free tier)
- Cache: **Upstash** (free tier)
- Storage: **Cloudflare R2** (free tier)

**Phase 2 ($1K → $10K MRR):**
- Keep Railway until $1K MRR
- Then migrate to **DigitalOcean App Platform** or **Hetzner** (cheaper than AWS)

**Phase 3 ($10K+):**
- Consider dedicated infrastructure
- Never go full AWS/GCP unless you have a team

### Why NOT AWS/GCP for solo dev?
- Complexity kills solo founders
- EC2/ECS requires someone to manage it
- You'll spend 10hrs/week on ops instead of building
- Cost is 5-10x higher than managed services

---

## 5. Docker on VPS — Worth It?

### Docker Pros
- Reproducibility across environments
- Easy deployment with docker-compose
- Can move between cloud providers

### Docker Cons
- You're now an ops person
- Updates = downtime (unless using compose with restart policies)
- Monitoring, logs, backups — all on you

**Decision:** Skip Docker for MVP
- Use Railway's built-in deployment (just git push)
- Later, use **Coolify** (open-source PaaS) on a $10 VPS if needed

---

## 6. Solo Dev Scaling Philosophy

### The Real Risk
> The biggest risk isn't tech — it's you burning out on ops. Every managed service = insurance against burnout.

### Year 1 (0 → $50K ARR)
- Use managed services aggressively
- Don't touch AWS until you have PMF
- Target: 2-4 hours/week on ops

### Year 2 ($50K → $200K)
- Add one self-hosted component (e.g., Coolify on Hetzner)
- Keep managed services for DB/cache
- Target: 4-6 hours/week on ops

### Year 3+ (if you get there)
- Consider dedicated infrastructure
- Hire a part-time DevOps or use a platform team

---

## 7. Revised Stack for India-Based Solo Dev

| Layer | Choice | Monthly Cost |
|-------|--------|--------------|
| Backend | Fastify + Node.js | — |
| Frontend | Next.js + Vercel | Free |
| Database | Supabase | Free → $25/mo |
| Auth | Supabase Auth | Free |
| Cache | Upstash Redis | Free → $10/mo |
| Storage | Cloudflare R2 | Free |
| Payments | Razorpay or DodoPayments | 2% + GST |
| Hosting | Railway | $5-20/mo |
| Email | Resend | Free tier |

**Total at launch: ~$15-30/mo**

---

## 8. Recommended Changes to Tech Stack Doc

1. **Replace Stripe** → Razorpay or DodoPayments
2. **Add exit strategy section** — what happens if you want to migrate off Supabase
3. **Add Hono as future consideration** — not for MVP
4. **Add backup strategy** — important for production apps

---

## 9. Additional CTO Recommendations

### Monitoring for Solo Dev
- **UptimeRobot** (free) — health checks
- **Sentry** (free tier) — error tracking
- **Logflare** (free) — logs for Bun/Node apps

### Backup Strategy
- Supabase: Enable Point-in-time Recovery (PITR)
- R2: Use R2 replicating to another bucket
- Code: Git is your backup

### Security for MVP
- Use Helmet.js
- Rate limiting (already in your doc)
- API key hashing (already in your doc)
- Add: Input sanitization for OG templates (XSS risk!)

---

## Summary

| Decision | Recommendation |
|----------|---------------|
| Backend | Stay Fastify + Node |
| Database | Supabase (not Convex) |
| Payments | Razorpay or DodoPayments |
| Hosting | Railway → DigitalOcean |
| Docker | Skip for MVP |
| Self-hosting | Only after $1K MRR |

This stack gives you:
- Lowest ops burden
- Fastest time to market
- Exit options if needed
- Total cost: ~$25-50/mo at launch
