import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { createApiKey } from "../lib/security";

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const generated = await createApiKey();

    await ctx.db.insert("apiKeys", {
      userId: args.userId,
      name: args.name,
      keyHash: generated.keyHash,
      keyPrefix: generated.keyPrefix,
      createdAt: now,
    });

    return {
      rawKey: generated.rawKey,
      keyPrefix: generated.keyPrefix,
    };
  },
});

export const touchLastUsed = mutation({
  args: { apiKeyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.apiKeyId, { lastUsedAt: Date.now() });
  },
});
