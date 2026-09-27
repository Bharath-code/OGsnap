import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { agencySiteUpdates } from "../../packages/core/src/agency";

const PLAN_LIMITS: Record<string, number> = {
  free: 100,
  hobby: 1000,
  pro: 5000,
  scale: 25000,
  agency: 5000,
};

const PAID_PLANS = ["hobby", "pro", "scale", "agency"] as const;
const toPlan = (plan: string) => PAID_PLANS.find((paid) => paid === plan) ?? "free";

export const upsertSubscriptionByPaymentId = internalMutation({
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
        plan: toPlan(args.plan),
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        renderLimit,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(existing._id, {
        paymentSubscriptionId: args.paymentSubscriptionId,
        paymentCustomerId: args.paymentCustomerId,
        plan: toPlan(args.plan),
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        renderLimit,
        updatedAt: now,
      });
    }

    const sites = await ctx.db
      .query("sites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const covered = toPlan(args.plan) === "agency" && args.status === "active";
    for (const { id, ...patch } of agencySiteUpdates(sites, covered)) {
      await ctx.db.patch(id, patch);
      // ponytail: re-renders the site image only; per-page images keep their old watermark state until their next render
      await ctx.scheduler.runAfter(0, internal.sites.actions.render, { siteId: id });
    }
  },
});

export const recordWebhookEvent = internalMutation({
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

    if (existing) return { webhookEventId: existing._id, alreadyProcessed: existing.processed };

    const webhookEventId = await ctx.db.insert("webhookEvents", {
      provider: args.provider,
      eventId: args.eventId,
      eventType: args.eventType,
      payload: args.payload,
      receivedAt: Date.now(),
      processed: false,
    });
    return { webhookEventId, alreadyProcessed: false };
  },
});

export const markWebhookProcessed = internalMutation({
  args: {
    webhookEventId: v.id("webhookEvents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.webhookEventId, { processed: true });
  },
});
