import { z } from "zod";
import { checkPreview, isPublicUrl, type PreviewCheck } from "@ogsnap/core/preview-audit";
import { clientIp, rateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  url: z.string().url().max(2048).refine(isPublicUrl),
});

export async function POST(request: Request) {
  if (rateLimited(`check:${clientIp(request)}`, 20, 60 * 60 * 1000)) {
    return new Response("Too many checks from this network. Try again in an hour.", { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Enter a full website address, like https://example.com", { status: 400 });
  }

  const { url } = parsed.data;
  try {
    return Response.json(await checkPreview(url));
  } catch (error) {
    const reason = error instanceof Error ? error.message : "error";
    const result: PreviewCheck = { url, platform: "", imageStatus: reason, hasOgTitle: false, verdict: "broken" };
    return Response.json(result);
  }
}
