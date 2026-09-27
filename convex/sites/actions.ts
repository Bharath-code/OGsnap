"use node";

import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";

export const render = internalAction({
  args: {
    siteId: v.id("sites"),
  },
  handler: async (ctx, { siteId }) => {
    const site = await ctx.runQuery(internal.sites.queries.getInternal, { siteId });
    if (!site || site.status === "canceled") return;

    const url = `https://${site.domain}`;
    try {
      let brandKitId = site.brandKitId;
      let title = site.title;
      let description: string | undefined;

      if (!brandKitId) {
        const extracted = await ctx.runAction(api.brand.actions.extractFromUrl, { url });
        if (!extracted.success) throw new Error(extracted.error);
        const brand = extracted.result;
        brandKitId = await ctx.runMutation(internal.sites.mutations.createBrandKit, {
          userId: site.userId,
          name: site.domain,
          logoUrl: brand.logoUrl,
          primaryColor: brand.primaryColor,
          backgroundColor: brand.backgroundColor,
          fontFamily: brand.fontFamily,
        });
        title = brand.title;
        description = brand.description || undefined;
      }

      const rendered = await ctx.runAction(internal.render.actions.generateImageInternal, {
        userId: site.userId,
        brandKitId,
        plan: site.status === "active" ? "hobby" : "free",
        url,
        title: title ?? site.domain,
        description,
      });

      await ctx.runMutation(internal.sites.mutations.recordRender, {
        siteId,
        brandKitId,
        title,
        imageUrl: rendered.imageUrl,
        renderError: undefined,
      });
    } catch (error) {
      await ctx.runMutation(internal.sites.mutations.recordRender, {
        siteId,
        renderError: error instanceof Error ? error.message.slice(0, 300) : "Render failed",
      });
    }
  },
});
