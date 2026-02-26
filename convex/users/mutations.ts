import { mutation } from "../_generated/server";
import { v } from "convex/values";

const identityArgs = {
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    organizationSlug: v.optional(v.string()),
    organizationRole: v.optional(v.string()),
  },
};

export const upsertFromIdentity = mutation({
  ...identityArgs,
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        fullName: args.fullName,
        imageUrl: args.imageUrl,
        organizationId: args.organizationId,
        organizationSlug: args.organizationSlug,
        organizationRole: args.organizationRole,
        updatedAt: now,
        lastSeenAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      fullName: args.fullName,
      imageUrl: args.imageUrl,
      organizationId: args.organizationId,
      organizationSlug: args.organizationSlug,
      organizationRole: args.organizationRole,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });
  },
});

export const ensureUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email ?? existing.email,
        updatedAt: now,
        lastSeenAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });
  },
});
