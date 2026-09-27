"use node";

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { buildOgHtml } from "./template";
import { generateSocialMetadata } from "../lib/llm";

export const generateImageInternal = internalAction({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("hobby"), v.literal("pro"), v.literal("scale"), v.literal("agency")),
    url: v.string(),
    brandKitId: v.optional(v.id("brandKits")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    multi: v.optional(v.boolean()),
    polish: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const rendererUrl = process.env.RENDERER_SERVICE_URL;
    if (!rendererUrl) {
      throw new Error("RENDERER_SERVICE_URL is not configured");
    }

    const brandKit = args.brandKitId
      ? await ctx.runQuery(internal.brand.queries.getById, { brandKitId: args.brandKitId })
      : await ctx.runQuery(api.brand.queries.getDefaultBrandKit, { userId: args.userId });

    const html = buildOgHtml({
      title: args.title ?? "Untitled",
      description: args.description ?? "",
      primaryColor: brandKit?.primaryColor ?? "#3B82F6",
      backgroundColor: brandKit?.backgroundColor ?? "#0F172A",
      logoUrl: brandKit?.logoUrl,
      fontFamily: brandKit?.fontFamily,
      watermark: args.plan === "free",
    });

    const startedAt = performance.now();

    // Start LLM metadata generation concurrently if polish is requested
    const polishEnabled = args.polish ?? false;
    let socialMetadataPromise: Promise<{ altText: string; twitterCopy: string; linkedinCopy: string } | null> = Promise.resolve(null);
    if (polishEnabled && args.title) {
      socialMetadataPromise = generateSocialMetadata(args.title, args.description ?? "");
    }

    if (args.multi) {
      const platforms = {
        og: { width: 1200, height: 630 },
        twitter: { width: 1200, height: 675 },
        linkedin: { width: 1200, height: 627 },
        slack: { width: 1200, height: 630 },
        discord: { width: 1200, height: 630 },
        square: { width: 1080, height: 1080 },
        story: { width: 1080, height: 1920 },
      };

      const renderPromises = Object.entries(platforms).map(async ([name, dim]) => {
        const response = await fetch(`${rendererUrl}/render`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RENDERER_INTERNAL_TOKEN ?? ""}`,
          },
          body: JSON.stringify({
            html,
            width: dim.width,
            height: dim.height,
            addWatermark: args.plan === "free",
            engine: args.plan === "free" ? "satori" : "playwright",
          }),
        });

        if (!response.ok) {
          const details = await response.text();
          throw new Error(`Renderer error for ${name} (${response.status}): ${details}`);
        }

        const payload = (await response.json()) as { imageUrl: string };
        return [name, payload.imageUrl];
      });

      const [results, metadata] = await Promise.all([
        Promise.all(renderPromises),
        socialMetadataPromise,
      ]);

      const images = Object.fromEntries(results);

      return {
        images,
        metadata: metadata ?? undefined,
        renderTimeMs: Math.round(performance.now() - startedAt),
      };
    }

    const response = await fetch(`${rendererUrl}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RENDERER_INTERNAL_TOKEN ?? ""}`,
      },
      body: JSON.stringify({
        html,
        width: args.width ?? 1200,
        height: args.height ?? 630,
        addWatermark: args.plan === "free",
        engine: args.plan === "free" ? "satori" : "playwright",
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Renderer error (${response.status}): ${details}`);
    }

    const [payload, metadata] = await Promise.all([
      response.json() as Promise<{ imageUrl: string }>,
      socialMetadataPromise,
    ]);

    return {
      imageUrl: payload.imageUrl,
      metadata: metadata ?? undefined,
      renderTimeMs: Math.round(performance.now() - startedAt),
    };
  },
});

// Public entry for the dashboard playground: user and plan come from the Clerk session, never from the client
export const generateImage = action({
  args: {
    url: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    multi: v.optional(v.boolean()),
    polish: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<unknown> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not signed in");

    const caller = await ctx.runQuery(internal.render.queries.getCallerPlan, { clerkId: identity.subject });
    if (!caller) throw new Error("User not found");

    return await ctx.runAction(internal.render.actions.generateImageInternal, {
      ...args,
      userId: caller.userId,
      plan: caller.plan,
    });
  },
});
