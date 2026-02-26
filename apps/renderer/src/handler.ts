import { z } from "zod";
import { applyWatermark } from "./watermark";
import { storeImage } from "./storage";
import type { BrowserPool } from "./pool";

const renderSchema = z.object({
  html: z.string().min(1),
  width: z.number().int().min(200).max(3000).optional(),
  height: z.number().int().min(200).max(3000).optional(),
  addWatermark: z.boolean().optional(),
});

export function buildRenderHandler(pool: BrowserPool) {
  return async function render(payload: unknown): Promise<{ imageUrl: string }> {
    const parsed = renderSchema.parse(payload);
    const browser = await pool.acquire();

    try {
      const page = await browser.newPage({
        viewport: {
          width: parsed.width ?? 1200,
          height: parsed.height ?? 630,
        },
      });

      await page.setContent(parsed.html, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(250);

      const screenshot = (await page.screenshot({
        type: "png",
        fullPage: false,
      })) as Buffer;

      await page.close();

      const finalImage = parsed.addWatermark ? await applyWatermark(screenshot) : screenshot;
      const imageUrl = await storeImage(finalImage);
      return { imageUrl };
    } finally {
      pool.release(browser);
    }
  };
}
