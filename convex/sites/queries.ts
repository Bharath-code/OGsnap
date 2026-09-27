import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    const sites = await ctx.db
      .query("sites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return sites.map((site) => ({
      id: site._id,
      domain: site.domain,
      status: site.status,
      imageUrl: site.imageUrl,
      renderError: site.renderError,
      createdAt: site.createdAt,
    }));
  },
});

export const getInternal = internalQuery({
  args: {
    siteId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("sites", args.siteId);
    return id ? await ctx.db.get(id) : null;
  },
});
