import { query } from "../_generated/server";
import { v } from "convex/values";

export const getDefaultBrandKit = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brandKits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();
  },
});

export const listByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brandKits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
