import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { monthBucket } from "../lib/cache";

export const recordRender = mutation({
  args: {
    userId: v.id("users"),
    apiKeyId: v.id("apiKeys"),
    cacheKey: v.string(),
    originalUrl: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.string(),
    cacheHit: v.boolean(),
    renderTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("renderLogs", {
      userId: args.userId,
      apiKeyId: args.apiKeyId,
      cacheKey: args.cacheKey,
      originalUrl: args.originalUrl,
      title: args.title,
      description: args.description,
      imageUrl: args.imageUrl,
      cacheHit: args.cacheHit,
      renderTimeMs: args.renderTimeMs,
      createdAt: now,
    });

    const month = monthBucket(now);
    const usage = await ctx.db
      .query("usageCounters")
      .withIndex("by_user_and_month", (q) => q.eq("userId", args.userId).eq("month", month))
      .first();

    if (!usage) {
      await ctx.db.insert("usageCounters", {
        userId: args.userId,
        month,
        rendersUsed: 1,
        updatedAt: now,
      });
      return;
    }

    await ctx.db.patch(usage._id, {
      rendersUsed: usage.rendersUsed + 1,
      updatedAt: now,
    });
  },
});

export const seedDefaultSubscriptionIfMissing = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) return existing;

    const now = Date.now();
    const id = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      plan: "free",
      status: "active",
      renderLimit: 100,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(id);
  },
});
