import { mutation } from "../_generated/server";
import { v } from "convex/values";

const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  hobby: 1000,
  pro: 5000,
  scale: 25000,
};

export const upsertSubscriptionByPaymentId = mutation({
  args: {
    paymentSubscriptionId: v.string(),
    paymentCustomerId: v.optional(v.string()),
    userId: v.id("users"),
    plan: v.string(),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const renderLimit = PLAN_LIMITS[args.plan] ?? PLAN_LIMITS.free;

    if (!existing) {
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        paymentSubscriptionId: args.paymentSubscriptionId,
        paymentCustomerId: args.paymentCustomerId,
        plan: args.plan === "hobby" || args.plan === "pro" || args.plan === "scale" ? args.plan : "free",
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        renderLimit,
        createdAt: now,
        updatedAt: now,
      });
      return;
    }

    await ctx.db.patch(existing._id, {
      paymentSubscriptionId: args.paymentSubscriptionId,
      paymentCustomerId: args.paymentCustomerId,
      plan: args.plan === "hobby" || args.plan === "pro" || args.plan === "scale" ? args.plan : "free",
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      renderLimit,
      updatedAt: now,
    });
  },
});

export const recordWebhookEvent = mutation({
  args: {
    provider: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("by_provider_and_event", (q) => q.eq("provider", args.provider).eq("eventId", args.eventId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("webhookEvents", {
      provider: args.provider,
      eventId: args.eventId,
      eventType: args.eventType,
      payload: args.payload,
      receivedAt: Date.now(),
      processed: false,
    });
  },
});

export const markWebhookProcessed = mutation({
  args: {
    webhookEventId: v.id("webhookEvents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.webhookEventId, { processed: true });
  },
});
