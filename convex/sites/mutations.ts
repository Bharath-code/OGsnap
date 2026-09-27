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
