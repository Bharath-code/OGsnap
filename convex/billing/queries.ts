import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

// Agency buyers from before users.paymentCustomerId existed only have it on their subscription.
export const customerIdForClerk = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) return null;
    if (user.paymentCustomerId) return user.paymentCustomerId;
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    return subscription?.paymentCustomerId ?? null;
  },
});
