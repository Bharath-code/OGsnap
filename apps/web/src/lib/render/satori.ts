import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import { inter400, inter700 } from "./fonts";

const fonts = [
  { name: "Inter", data: Buffer.from(inter400, "base64"), weight: 400 as const, style: "normal" as const },
  { name: "Inter", data: Buffer.from(inter700, "base64"), weight: 700 as const, style: "normal" as const },
];

// whitespace between tags becomes extra text children, which Satori rejects on non-flex parents
export async function renderWithSatori(options: { htmlContent: string; width: number; height: number }): Promise<Buffer> {
  const svg = await satori(html(options.htmlContent.replace(/>\s+</g, "><")) as Parameters<typeof satori>[0], {
    width: options.width,
    height: options.height,
    fonts,
  });
  // satori already outlines text, so skip resvg's ~2s system-font scan
  return new Resvg(svg, { fitTo: { mode: "width", value: options.width }, font: { loadSystemFonts: false } }).render().asPng();
}
