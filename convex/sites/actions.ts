"use node";

import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import { pageTitle, parseMeta, titleFromPath } from "../lib/meta";

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

const bareHost = (host: string) => host.replace(/^www\./, "");

async function fetchPageMeta(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "OGSnapBot/1.0 (+https://ogsnap.dev)", Accept: "text/html" },
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
    throw new Error(`Page returned ${response.status}`);
  }
  // the title ends up in a public image, so never take it from wherever a redirect points
  if (bareHost(new URL(response.url).hostname) !== bareHost(new URL(url).hostname)) {
    throw new Error("Page redirected off-site");
  }
  const html = await response.text();
  const meta = parseMeta(html);
  return { title: pageTitle(html), description: meta.get("og:description") ?? meta.get("description") };
}

export const renderPage = internalAction({
  args: {
    siteId: v.id("sites"),
    path: v.string(),
  },
  handler: async (ctx, { siteId, path }) => {
    const site = await ctx.runQuery(internal.sites.queries.getInternal, { siteId });
    if (!site || site.status === "canceled" || !site.brandKitId) return;

    const url = `https://${site.domain}${path}`;
    try {
      const page = await fetchPageMeta(url);
      // ponytail: SPAs serve the homepage <title> on every route, so fall back to the path; prerendering is the real fix
      const title = page.title && page.title !== site.title ? page.title : titleFromPath(path) || site.title || site.domain;
      const watermarked = site.status !== "active";

      const rendered = await ctx.runAction(internal.render.actions.generateImageInternal, {
        userId: site.userId,
        brandKitId: site.brandKitId,
        plan: watermarked ? "free" : "hobby",
        url,
        title,
        description: page.description,
      });

      await ctx.runMutation(internal.sites.mutations.recordPageRender, {
        siteId,
        path,
        title,
        imageUrl: rendered.imageUrl,
        watermarked,
      });
    } catch (error) {
      await ctx.runMutation(internal.sites.mutations.recordPageRender, {
        siteId,
        path,
        renderError: error instanceof Error ? error.message.slice(0, 300) : "Render failed",
      });
    }
  },
});
