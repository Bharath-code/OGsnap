"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

type FirecrawlBranding = {
  logo?: string;
  colors?: { primary?: string; accent?: string; background?: string };
  fonts?: Array<{ family?: string }>;
  typography?: { fontFamilies?: { primary?: string; heading?: string } };
  images?: { logo?: string; favicon?: string };
};

const HEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const hex = (c?: string) => (c && HEX.test(c.trim()) ? c.trim() : undefined);
const httpUrl = (u?: string) => (u && /^https?:\/\//i.test(u) ? u : undefined);

export const extractFromUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return { success: false as const, error: "FIRECRAWL_API_KEY is not configured" };
    }

    let data: { branding?: FirecrawlBranding; metadata?: { title?: string; description?: string } } | undefined;
    try {
      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: args.url, formats: ["branding"] }),
      });

      if (!response.ok) {
        const details = await response.text();
        return {
          success: false as const,
          error: `Firecrawl request failed: ${response.status} - ${details.slice(0, 200)}`,
        };
      }

      data = ((await response.json()) as { data?: typeof data }).data;
    } catch (err) {
      return {
        success: false as const,
        error: `Failed to fetch URL: ${err instanceof Error ? err.message : "Unknown error"}`,
      };
    }

    const branding = data?.branding;
    if (!branding) {
      return { success: false as const, error: "Firecrawl returned no branding data for this URL" };
    }

    return {
      success: true as const,
      result: {
        title: (data?.metadata?.title ?? "Your Website").slice(0, 100),
        description: (data?.metadata?.description ?? "").slice(0, 200),
        logoUrl: httpUrl(branding.logo) ?? httpUrl(branding.images?.logo) ?? httpUrl(branding.images?.favicon),
        primaryColor: hex(branding.colors?.primary) ?? "#3B82F6",
        backgroundColor: hex(branding.colors?.background) ?? "#0F172A",
        accentColor: hex(branding.colors?.accent),
        fontFamily:
          branding.typography?.fontFamilies?.primary ??
          branding.fonts?.[0]?.family ??
          "Inter, system-ui, sans-serif",
        brandExtractionMethod: "firecrawl-branding" as const,
      },
    };
  },
});
