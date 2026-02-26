import { query } from "../_generated/server";
import { v } from "convex/values";

export const getByHash = query({
  args: { keyHash: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("apiKeys")
      .withIndex("by_hash", (q) => q.eq("keyHash", args.keyHash))
      .first();

    if (!record || record.revokedAt) return null;

    return {
      _id: record._id,
      userId: record.userId,
      keyPrefix: record.keyPrefix,
      lastUsedAt: record.lastUsedAt,
    };
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
