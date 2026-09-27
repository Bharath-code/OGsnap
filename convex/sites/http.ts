import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

const fallbackUrl = () =>
  process.env.OG_FALLBACK_IMAGE_URL ?? `${process.env.WEB_BASE_URL ?? "https://ogsnap.dev"}/og-fallback.png`;

const redirect = (location: string, maxAge: number) =>
  new Response(null, {
    status: 302,
    headers: { Location: location, "Cache-Control": `public, max-age=${maxAge}` },
  });

// GET /v1/site/{siteId}/og.png: never renders inline, so crawlers always get an answer in milliseconds
export const siteImage = httpAction(async (ctx, request) => {
  const match = new URL(request.url).pathname.match(/^\/v1\/site\/([^/]+)\/og\.png$/);
  if (!match) return new Response("Not found", { status: 404 });

  const site = await ctx.runQuery(internal.sites.queries.getInternal, { siteId: match[1] });
  if (!site || site.status === "canceled" || !site.imageUrl) {
    return redirect(fallbackUrl(), 60);
  }

  // ponytail: short max-age so the unwatermarked re-render after payment shows up quickly
  return redirect(site.imageUrl, 300);
});
