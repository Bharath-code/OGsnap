import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const getByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});
