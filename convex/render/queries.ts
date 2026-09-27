import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getCachedRender = query({
  args: {
    cacheKey: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("renderLogs")
      .withIndex("by_cache_key", (q) => q.eq("cacheKey", args.cacheKey))
      .order("desc")
      .first();
  },
});

export const listRecentByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("renderLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 20);

    return rows;
  },
});

export const getCallerPlan = internalQuery({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) return null;

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    return { userId: user._id, plan: subscription?.plan ?? ("free" as const) };
  },
});
