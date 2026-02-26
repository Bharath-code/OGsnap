"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

export const extractFromUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "FIRECRAWL_API_KEY is not configured",
      };
    }

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: args.url,
        formats: ["html"],
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      return {
        success: false,
        error: `Firecrawl request failed: ${details}`,
      };
    }

    const payload = (await response.json()) as {
      data?: {
        metadata?: {
          title?: string;
        };
        html?: string;
      };
    };

    const html = payload.data?.html ?? "";

    const colorMatch = html.match(/--primary:\s*(#[0-9a-fA-F]{3,6})/i);
    const fontMatch = html.match(/font-family:\s*['\"]?([^;'\"]+)/i);
    const ogImageMatch = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i);

    return {
      success: true,
      result: {
        title: payload.data?.metadata?.title,
        logoUrl: ogImageMatch?.[1],
        primaryColor: colorMatch?.[1] ?? "#3B82F6",
        backgroundColor: "#0F172A",
        fontFamily: fontMatch?.[1]?.trim() ?? "Inter, system-ui, sans-serif",
      },
    };
  },
});
