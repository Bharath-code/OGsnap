import { query } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { monthBucket } from "../lib/cache";

function positiveLimit(value: number | undefined, fallback: number, max: number): number {
  if (value === undefined || !Number.isInteger(value) || value <= 0) return fallback;
  return Math.min(value, max);
}

async function getUsageForCurrentMonth(ctx: any, userId: Id<"users">) {
  const month = monthBucket(Date.now());
  const [usage, subscription] = await Promise.all([
    ctx.db
      .query("usageCounters")
      .withIndex("by_user_and_month", (q: any) => q.eq("userId", userId).eq("month", month))
      .first(),
    ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first(),
  ]);

  const renderLimit = subscription?.renderLimit ?? 100;
  const rendersUsed = usage?.rendersUsed ?? 0;

  return {
    month,
    plan: subscription?.plan ?? "free",
    rendersUsed,
    renderLimit,
    remaining: Math.max(renderLimit - rendersUsed, 0),
  };
}

export const getKeysPanelByClerkId = query({
  args: {
    clerkId: v.string(),
    apiKeyLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) return null;

    const userId = user._id as Id<"users">;
    const apiKeyLimit = positiveLimit(args.apiKeyLimit, 50, 200);

    const [keys, usage] = await Promise.all([
      ctx.db.query("apiKeys").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      getUsageForCurrentMonth(ctx, userId),
    ]);

    return {
      success: true as const,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        fullName: user.fullName,
      },
      usage,
      keys: keys
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, apiKeyLimit)
        .map((row) => ({
          id: row._id,
          name: row.name,
          keyPrefix: row.keyPrefix,
          createdAt: row.createdAt,
          lastUsedAt: row.lastUsedAt,
          revokedAt: row.revokedAt,
          status: row.revokedAt ? ("revoked" as const) : ("active" as const),
        })),
    };
  },
});

export const getRendersPanelByClerkId = query({
  args: {
    clerkId: v.string(),
    renderLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) return null;

    const userId = user._id as Id<"users">;
    const renderLimit = positiveLimit(args.renderLimit, 25, 100);

    const [renders, usage] = await Promise.all([
      ctx.db
        .query("renderLogs")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(renderLimit),
      getUsageForCurrentMonth(ctx, userId),
    ]);

    return {
      success: true as const,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        fullName: user.fullName,
      },
      usage,
      renders: renders.map((row) => ({
        id: row._id,
        originalUrl: row.originalUrl,
        title: row.title,
        cacheHit: row.cacheHit,
        renderTimeMs: row.renderTimeMs,
        createdAt: row.createdAt,
      })),
    };
  },
});
