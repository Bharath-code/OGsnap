import { z } from "zod";
import { postConvexInternal } from "@/lib/user-sync";
import { clientIp, rateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().trim().email().max(254),
  url: z.string().url().max(2048),
});

// ponytail: hostname-only guess; custom domains show as "other" until T11's shared detector exists
function guessPlatform(url: string) {
  const host = new URL(url).hostname;
  if (host.endsWith(".lovable.app")) return "lovable";
  if (/\.framer\.(app|website)$/.test(host)) return "framer";
  if (host.endsWith(".webflow.io")) return "webflow";
  return "other";
}

export async function POST(request: Request) {
  if (rateLimited(`leads:${clientIp(request)}`, 10, 60 * 60 * 1000)) {
    return new Response("Too many requests. Try again later.", { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Enter a valid email address", { status: 400 });
  }

  try {
    const response = await postConvexInternal("/v1/internal/leads", {
      ...parsed.data,
      platform: guessPlatform(parsed.data.url),
      source: "landing",
    });
    if (!response.ok) throw new Error(`leads ${response.status}: ${await response.text()}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error("lead capture failed", error);
    return new Response("Could not save your email. Please try again.", { status: 502 });
  }
}
