import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { normalizePath } from "./mutations";

const fallbackUrl = () =>
  process.env.OG_FALLBACK_IMAGE_URL ?? `${process.env.WEB_BASE_URL ?? "https://ogsnap.dev"}/og-fallback.png`;

const redirect = (location: string, maxAge: number) =>
  new Response(null, {
    status: 302,
    headers: { Location: location, "Cache-Control": `public, max-age=${maxAge}` },
  });

// GET /v1/site/{siteId}/og.png[?path=/pricing]: never renders inline, so crawlers always get an answer in milliseconds
export const siteImage = httpAction(async (ctx, request) => {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/v1\/site\/([^/]+)\/og\.png$/);
  const path = normalizePath(url.searchParams.get("path"));
  if (!match || !path) return new Response("Not found", { status: 404 });

  // unseen or stale paths get the site image now and a page render in the background
  const imageUrl = await ctx.runMutation(internal.sites.mutations.requestPageImage, { siteId: match[1], path });
  if (!imageUrl) return redirect(fallbackUrl(), 60);

  // ponytail: short max-age so the unwatermarked re-render after payment shows up quickly
  return redirect(imageUrl, 300);
});
