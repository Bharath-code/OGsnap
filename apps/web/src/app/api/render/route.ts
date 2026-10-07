import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { renderWithSatori } from "@/lib/render/satori";
import { storeImage } from "@/lib/render/storage";

export const runtime = "nodejs";
export const maxDuration = 30;

const schema = z.object({
  html: z.string().min(1).max(200_000),
  width: z.number().int().min(200).max(3000).optional(),
  height: z.number().int().min(200).max(3000).optional(),
});

// ponytail: satori only, and the watermark is the template's own badge (no sharp); the Chromium engine stays in apps/renderer if templates outgrow satori's CSS subset
function authorized(header: string | null): boolean {
  const token = process.env.RENDERER_INTERNAL_TOKEN;
  if (!token || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${token}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request.headers.get("authorization"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return new Response("Invalid render request", { status: 400 });
  }

  const { html, width = 1200, height = 630 } = parsed.data;
  try {
    // a dead or unsupported logo must not break the preview: retry once without images
    const png = await renderWithSatori({ htmlContent: html, width, height }).catch(() =>
      renderWithSatori({ htmlContent: html.replace(/<img\b[^>]*>/gi, `<div style="display:flex"></div>`), width, height }),
    );
    const imageUrl = await storeImage(png);
    return Response.json({ imageUrl });
  } catch (error) {
    console.error("render failed", error);
    return new Response("Render failed", { status: 500 });
  }
}
