import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { monthBucket } from "../lib/cache";

export const incrementMonthlyUsage = mutation({
  args: {
    userId: v.id("users"),
    by: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const incrementBy = args.by ?? 1;
    const now = Date.now();
    const month = monthBucket(now);

    const existing = await ctx.db
      .query("usageCounters")
      .withIndex("by_user_and_month", (q) => q.eq("userId", args.userId).eq("month", month))
      .first();

    if (!existing) {
      await ctx.db.insert("usageCounters", {
        userId: args.userId,
        month,
        rendersUsed: incrementBy,
        updatedAt: now,
      });
      return;
    }

    await ctx.db.patch(existing._id, {
      rendersUsed: existing.rendersUsed + incrementBy,
      updatedAt: now,
    });
  },
});
