import { internalMutation, mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

const HOSTNAME = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normalizeDomain(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  try {
    const host = new URL(/^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`).hostname;
    return HOSTNAME.test(host) ? host : null;
  } catch {
    return null;
  }
}

export const create = mutation({
  args: {
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not signed in");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    const domain = normalizeDomain(args.domain);
    if (!domain) throw new Error("Enter a valid domain, like example.com");

    const existing = await ctx.db
      .query("sites")
      .withIndex("by_user_and_domain", (q) => q.eq("userId", user._id).eq("domain", domain))
      .first();
    if (existing) return existing._id;

    const siteId = await ctx.db.insert("sites", {
      userId: user._id,
      domain,
      status: "trial",
      createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.sites.actions.render, { siteId });
    return siteId;
  },
});

export const createBrandKit = internalMutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    backgroundColor: v.string(),
    fontFamily: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("brandKits", {
      ...args,
      isDefault: false,
      brandExtractionMethod: "firecrawl-branding",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const recordRender = internalMutation({
  args: {
    siteId: v.id("sites"),
    brandKitId: v.optional(v.id("brandKits")),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    renderError: v.optional(v.string()),
  },
  handler: async (ctx, { siteId, ...patch }) => {
    await ctx.db.patch(siteId, {
      ...patch,
      ...(patch.imageUrl ? { renderedAt: Date.now() } : {}),
    });
  },
});

export const setStatusFromBilling = internalMutation({
  args: {
    siteId: v.string(),
    ownerId: v.string(),
    status: v.union(v.literal("trial"), v.literal("active"), v.literal("canceled")),
  },
  handler: async (ctx, args) => {
    const siteId = ctx.db.normalizeId("sites", args.siteId);
    const site = siteId ? await ctx.db.get(siteId) : null;
    // only the site's owner can change it; a checkout for someone else's site is ignored
    if (!siteId || !site || site.userId !== args.ownerId || site.status === args.status) return false;

    await ctx.db.patch(siteId, { status: args.status });
    // re-render so active sites lose the watermark; canceled sites fall back via the image route
    if (args.status === "active") await ctx.scheduler.runAfter(0, internal.sites.actions.render, { siteId });
    return true;
  },
});

// ponytail: caps what a stranger can make us render by requesting made-up paths; raise per plan if real sites hit it
const MAX_PAGES_PER_SITE = 200;
const RERENDER_AFTER_MS = 10 * 60 * 1000;

export function normalizePath(input: string | null): string | null {
  if (!input) return "/";
  if (!input.startsWith("/") || input.startsWith("//") || input.length > 300) return null;
  try {
    const { pathname } = new URL(input, "https://x.invalid");
    return pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  } catch {
    return null;
  }
}

// Returns the best image available now, and queues a page render when one is missing or stale
export const requestPageImage = internalMutation({
  args: {
    siteId: v.string(),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    const siteId = ctx.db.normalizeId("sites", args.siteId);
    const site = siteId ? await ctx.db.get(siteId) : null;
    if (!siteId || !site || site.status === "canceled") return null;
    if (args.path === "/" || !site.brandKitId) return site.imageUrl ?? null;

    const page = await ctx.db
      .query("sitePages")
      .withIndex("by_site_and_path", (q) => q.eq("siteId", siteId).eq("path", args.path))
      .first();

    const stale = !page?.imageUrl || (site.status === "active" && page.watermarked);
    const due = !page || Date.now() - page.requestedAt > RERENDER_AFTER_MS;
    if (stale && due) {
      if (page) {
        await ctx.db.patch(page._id, { requestedAt: Date.now() });
      } else {
        const existing = await ctx.db
          .query("sitePages")
          .withIndex("by_site_and_path", (q) => q.eq("siteId", siteId))
          .take(MAX_PAGES_PER_SITE);
        if (existing.length >= MAX_PAGES_PER_SITE) return site.imageUrl ?? null;
        await ctx.db.insert("sitePages", { siteId, path: args.path, requestedAt: Date.now() });
      }
      await ctx.scheduler.runAfter(0, internal.sites.actions.renderPage, { siteId, path: args.path });
    }

    return page?.imageUrl ?? site.imageUrl ?? null;
  },
});

export const recordPageRender = internalMutation({
  args: {
    siteId: v.id("sites"),
    path: v.string(),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    watermarked: v.optional(v.boolean()),
    renderError: v.optional(v.string()),
  },
  handler: async (ctx, { siteId, path, ...patch }) => {
    const page = await ctx.db
      .query("sitePages")
      .withIndex("by_site_and_path", (q) => q.eq("siteId", siteId).eq("path", path))
      .first();
    if (!page) return;
    await ctx.db.patch(page._id, {
      ...patch,
      ...(patch.imageUrl ? { renderedAt: Date.now(), renderError: undefined } : {}),
    });
  },
});
