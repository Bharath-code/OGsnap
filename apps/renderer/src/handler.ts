import { z } from "zod";
import { applyWatermark } from "./watermark";
import { storeImage } from "./storage";
import type { BrowserPool } from "./pool";
import { renderWithSatori } from "./satori";

const renderSchema = z.object({
  html: z.string().min(1),
  width: z.number().int().min(200).max(3000).optional(),
  height: z.number().int().min(200).max(3000).optional(),
  addWatermark: z.boolean().optional(),
  engine: z.enum(["playwright", "satori"]).optional(),
});

export function buildRenderHandler(pool: BrowserPool) {
  return async function render(payload: unknown): Promise<{ imageUrl: string }> {
    const parsed = renderSchema.parse(payload);
    const width = parsed.width ?? 1200;
    const height = parsed.height ?? 630;

    let imageBuffer: Buffer;

    if (parsed.engine === "satori") {
      try {
        imageBuffer = await renderWithSatori({
          htmlContent: parsed.html,
          width,
          height,
        });
      } catch (error) {
        console.error("Satori render failed, falling back to Playwright:", error);
        // Fallback to Playwright if Satori fails
        imageBuffer = await renderPlaywright(parsed.html, width, height, pool);
      }
    } else {
      imageBuffer = await renderPlaywright(parsed.html, width, height, pool);
    }

    const finalImage = parsed.addWatermark ? await applyWatermark(imageBuffer) : imageBuffer;
    const imageUrl = await storeImage(finalImage);
    return { imageUrl };
  };
}

async function renderPlaywright(
  htmlContent: string,
  width: number,
  height: number,
  pool: BrowserPool
): Promise<Buffer> {
  const browser = await pool.acquire();
  try {
    const page = await browser.newPage({
      viewport: {
        width,
        height,
      },
    });

    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded", // Wait for DOM loaded, faster than networkidle
    });
    
    // Check if the page has a custom content wrapper and wait for it
    try {
      await page.waitForSelector(".og-content", { timeout: 1000 });
    } catch {
      // Fallback timeout if selector isn't present
      await page.waitForTimeout(100);
    }

    const screenshot = (await page.screenshot({
      type: "png",
      fullPage: false,
    })) as Buffer;

    await page.close();
    return screenshot;
  } finally {
    pool.release(browser);
  }
}
