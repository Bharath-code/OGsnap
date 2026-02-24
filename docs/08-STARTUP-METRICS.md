# OGSnap — Financial & Startup Metrics
**Date:** February 2026  
**Perspective:** CEO, CTO, & CFO Analysis

---

## 1. Unit Economics & Cost Structure (CFO View)

Building a SaaS business around headless Chromium requires strict margin discipline. Compute is our primary variable cost. 

### Infrastructure Costs (Monthly Scale)

| Service | Tier / Plan | Cost at Launch (0 users) | Cost at $5K MRR (100k renders) |
|---------|-------------|----------------------------|--------------------------------|
| **Convex (DB/Cache)** | Free → Pay as you go | $0 | ~$15 |
| **Vercel (Dashboard)** | Hobby/Pro | $0 | $20 |
| **Railway (Renderer)**| Developer | $5 (1 instance) | ~$40 (Auto-scaled pool) |
| **Cloudflare R2** | Free (10GB) | $0 | $0 |
| **Clerk (Auth)** | Free (10k MAU) | $0 | $0 |
| **Resend (Email)**| Free (3k/mo) | $0 | $20 |
| **Total Server Cost** | | **$5/mo** | **~$95/mo** |

### Gross Margin Analysis

*   **Average Revenue Per User (ARPU):** ~$15 
    *(Assuming mostly Hobby $9/mo and some Pro $29/mo accounts)*
*   **Average Cost Per User (COGS):** ~$0.40
    *(Based on Railway compute spikes + DodoPayments processing fees)*
*   **Target Gross Margin:** **97%**
    *(Standard software margins are 80-90%. Because we heavily utilize Edge caching and Convex free tiers, our margins are exceptionally high).*

**CFO Verdict:** The business model is highly profitable once it crosses the breakeven threshold of just 2 paying Hobby users ($18/mo). Every dollar earned after $95/mo drops virtually straight to the bottom line.

---

## 2. Startup Metrics & Milestones (CEO View)

### The North Star Metric
> **"Weekly Active API Keys (WAAK)"**

*Why?* Revenue follows usage. If a developer integrates OGSnap into their Next.js app, they generate an API key. If that key is actively making requests (`WAAK`), it means their app is live and their content is being shared. If `WAAK` grows, churn approaches zero because removing our SDK requires actual engineering effort from the customer.

### Secondary Vital Metrics
1.  **Cache Hit Rate:** Target >90%. (CTO Metric: This dictates our profit margins. Every cache hit is pure profit; every cache miss costs compute).
2.  **Time-to-First-Render (TTFR):** Target <10 minutes. The time from a user hitting the landing page to seeing their first branded OG image in their own codebase.
3.  **Net Revenue Retention (NRR):** Target >110%. (Can we naturally upgrade $9 users to $29 users as their traffic grows without acquiring new users?).

---

## 3. Defining Product-Market Fit (PMF)

For a developer tool aimed at solo founders/agencies, PMF isn't about massive user acquisition; it's about retention and organic adoption.

**We have reached PMF when the following conditions are met:**

### 1. The "Pull" (Organic Demand)
*   **Metric:** 30% or more of new signups come from organic searches (npm, GitHub, Google) or word-of-mouth (Twitter, dev subreddits). 
*   **Signal:** Developers are sharing their referral links or mentioning `@ogsnap/next` in their own open-source boilerplates.

### 2. The "Stick" (Retention)
*   **Metric:** Gross user churn is < 5% per month.
*   **Signal:** Once the 3-line Next.js snippet is added to their `layout.tsx`, they never log back into our dashboard. They just pay the $9/mo subscription quietly forever because it "Just Works."

### 3. The "Survey" (Sean Ellis Test)
*   **Metric:** If we survey active users and ask, *"How would you feel if OGSnap disappeared tomorrow?"*, over 40% answer **"Very Disappointed."**
*   **Signal:** We have successfully eliminated the pain of managing their own Puppeteer/CSS pipelines.

---

## 4. The 12-Month Roadmap to $10k MRR

| Phase | Goal | Focus | Financial Target |
|-------|------|-------|------------------|
| **Months 1-2** | Survival | Ship MVP. Get 1st dollar from strangers. Fix critical bugs. | $100 MRR |
| **Months 3-4** | Distribution | Ship Astro, Svelte, Remix SDKs. Write SEO playbooks. | $1K MRR |
| **Months 5-8** | Agency Wedge | Launch "Pro" features: Team seats, custom domains. | $4K MRR |
| **Months 9-12**| Scale | Sponsorships on high-converting dev newsletters (e.g., Bytes). | $10K MRR |

**Summary:** OGSnap is a high-margin, low-churn "set it and forget it" utility. The execution risk is low because the technology (Playwright + Convex) is proven. The distribution risk is medium-to-high because developers hate paying for things they think they can build, until they realize maintaining it costs 10x more than $9/month.
