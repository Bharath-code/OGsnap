import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    fullName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    organizationSlug: v.optional(v.string()),
    organizationRole: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
  }).index("by_clerk", ["clerkId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    paymentCustomerId: v.optional(v.string()),
    paymentSubscriptionId: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("hobby"), v.literal("pro"), v.literal("scale")),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    renderLimit: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    keyHash: v.string(),
    keyPrefix: v.string(),
    name: v.string(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_hash", ["keyHash"])
    .index("by_user", ["userId"]),

  brandKits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.string(),
    backgroundColor: v.string(),
    fontFamily: v.string(),
    isDefault: v.boolean(),
    brandExtractionMethod: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  renderLogs: defineTable({
    userId: v.id("users"),
    apiKeyId: v.id("apiKeys"),
    cacheKey: v.string(),
    originalUrl: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    cacheHit: v.boolean(),
    imageUrl: v.string(),
    renderTimeMs: v.number(),
    createdAt: v.number(),
  })
    .index("by_cache_key", ["cacheKey"])
    .index("by_user", ["userId"]),

  usageCounters: defineTable({
    userId: v.id("users"),
    month: v.string(),
    rendersUsed: v.number(),
    updatedAt: v.number(),
  }).index("by_user_and_month", ["userId", "month"]),

  sites: defineTable({
    userId: v.id("users"),
    domain: v.string(),
    brandKitId: v.optional(v.id("brandKits")),
    status: v.union(v.literal("trial"), v.literal("active"), v.literal("canceled")),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    renderError: v.optional(v.string()),
    renderedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_domain", ["userId", "domain"]),

  sitePages: defineTable({
    siteId: v.id("sites"),
    path: v.string(),
    title: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    watermarked: v.optional(v.boolean()),
    renderError: v.optional(v.string()),
    requestedAt: v.number(),
    renderedAt: v.optional(v.number()),
  }).index("by_site_and_path", ["siteId", "path"]),

  leads: defineTable({
    email: v.string(),
    url: v.string(),
    platform: v.optional(v.string()),
    source: v.string(),
    createdAt: v.number(),
  }),

  webhookEvents: defineTable({
    provider: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    payload: v.string(),
    receivedAt: v.number(),
    processed: v.boolean(),
  })
    .index("by_provider_and_event", ["provider", "eventId"]),
});
