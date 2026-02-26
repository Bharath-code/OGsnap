import { query } from "../_generated/server";
import { v } from "convex/values";
import { monthBucket } from "../lib/cache";

export const getUsageForCurrentMonth = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const month = monthBucket(Date.now());

    const usage = await ctx.db
      .query("usageCounters")
      .withIndex("by_user_and_month", (q) => q.eq("userId", args.userId).eq("month", month))
      .first();

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const renderLimit = subscription?.renderLimit ?? 100;
    const plan = subscription?.plan ?? "free";

    return {
      month,
      plan,
      rendersUsed: usage?.rendersUsed ?? 0,
      renderLimit,
      remaining: Math.max(renderLimit - (usage?.rendersUsed ?? 0), 0),
    };
  },
});
