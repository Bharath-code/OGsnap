"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { buildOgHtml } from "./template";

export const generateImage = action({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("hobby"), v.literal("pro"), v.literal("scale")),
    url: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rendererUrl = process.env.RENDERER_SERVICE_URL;
    if (!rendererUrl) {
      throw new Error("RENDERER_SERVICE_URL is not configured");
    }

    const brandKit = await ctx.runQuery(api.brand.queries.getDefaultBrandKit, {
      userId: args.userId,
    });

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
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Renderer error (${response.status}): ${details}`);
    }

    const payload = (await response.json()) as { imageUrl: string };
    return {
      imageUrl: payload.imageUrl,
      renderTimeMs: Math.round(performance.now() - startedAt),
    };
  },
});
