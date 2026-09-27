import { z } from "zod";
import { postConvexInternal, syncIdentityToConvex } from "@/lib/user-sync";
import { clientIp, rateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({
  url: z.string().url().max(2048).refine((u) => /^https?:\/\//i.test(u)),
});

export async function POST(request: Request) {
  if (rateLimited(`preview:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
    return new Response("Too many previews from this network. Try again in an hour.", { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Enter a full website address, like https://example.com", { status: 400 });
  }

  try {
    const hostname = new URL(parsed.data.url).hostname.toLowerCase();
    // ponytail: one internal user per site hostname so anonymous brand kits never collide
    const userId = await syncIdentityToConvex({ clerkId: `site:${hostname}` });
    const response = await postConvexInternal("/v1/onboarding/magic", { userId, url: parsed.data.url, previews: 1 });

    if (!response.ok || !response.body) {
      return new Response("Preview service is unavailable", { status: 502 });
    }

    return new Response(response.body, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (error) {
    console.error("preview failed", error);
    return new Response("Preview service is unavailable", { status: 502 });
  }
}
