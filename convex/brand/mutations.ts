import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const upsertDefaultBrandKit = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    backgroundColor: v.string(),
    fontFamily: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingDefault = await ctx.db
      .query("brandKits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isDefault"), true))
      .first();

    if (!existingDefault) {
      return await ctx.db.insert("brandKits", {
        userId: args.userId,
        name: args.name ?? "Default",
        logoUrl: args.logoUrl,
        primaryColor: args.primaryColor,
        backgroundColor: args.backgroundColor,
        fontFamily: args.fontFamily,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(existingDefault._id, {
      name: args.name ?? existingDefault.name,
      logoUrl: args.logoUrl,
      primaryColor: args.primaryColor,
      backgroundColor: args.backgroundColor,
      fontFamily: args.fontFamily,
      updatedAt: now,
    });

    return existingDefault._id;
  },
});
