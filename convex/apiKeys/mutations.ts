import { internalMutation, mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { createApiKey } from "../lib/security";

// ponytail: ctx is any until real Convex codegen replaces the _generated stubs; then use MutationCtx
async function insertKey(ctx: any, userId: Id<"users">, name: string) {
  const generated = await createApiKey();
  await ctx.db.insert("apiKeys", {
    userId,
    name,
    keyHash: generated.keyHash,
    keyPrefix: generated.keyPrefix,
    createdAt: Date.now(),
  });
  return { rawKey: generated.rawKey, keyPrefix: generated.keyPrefix };
}

// Called from the browser: the owner is whoever is signed in, never an argument.
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to create an API key");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) throw new Error("Account not found. Reload the page and try again.");
    return await insertKey(ctx, user._id, args.name);
  },
});

export const createForUser = internalMutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => insertKey(ctx, args.userId, args.name),
});

export const touchLastUsed = mutation({
  args: { apiKeyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.apiKeyId, { lastUsedAt: Date.now() });
  },
});
