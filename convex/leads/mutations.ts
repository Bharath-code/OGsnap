import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
  args: {
    email: v.string(),
    url: v.string(),
    platform: v.optional(v.string()),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", { ...args, createdAt: Date.now() });
  },
});
