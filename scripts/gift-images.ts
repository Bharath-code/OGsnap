// Renders outreach gift images locally with the production template, no backend or R2 needed.
// Usage: node --no-warnings scripts/gift-images.ts .claudedocs/outreach/gifts/sites.json
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildOgHtml, escapeText } from "../convex/render/template.ts";
import { inter400, inter700 } from "../apps/web/src/lib/render/fonts.ts";

const require = createRequire(resolve("apps/web/package.json"));
const load = async (name: string) => import(pathToFileURL(require.resolve(name)).href);
const satoriModule = await load("satori");
const satori = satoriModule.default?.default ?? satoriModule.default;
const { html } = await load("satori-html");
const { Resvg } = require("@resvg/resvg-js");

const fonts = [
  { name: "Inter", data: Buffer.from(inter400, "base64"), weight: 400, style: "normal" },
  { name: "Inter", data: Buffer.from(inter700, "base64"), weight: 700, style: "normal" },
];

async function render(markup: string): Promise<Buffer> {
  const svg = await satori(html(markup.replace(/>\s+</g, "><")), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 }, font: { loadSystemFonts: false } }).render().asPng();
  if (png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) throw new Error("wrong image size");
  return png;
}

async function dataUri(url: string): Promise<string> {
  if (url.startsWith("data:")) return url;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  // sites mislabel files (a .png that is really a JPEG), so trust the bytes for raster images
  const type =
    bytes[0] === 0xff && bytes[1] === 0xd8
      ? "image/jpeg"
      : bytes[0] === 0x89 && bytes[1] === 0x50
        ? "image/png"
        : (response.headers.get("content-type")?.split(";")[0] ?? "image/png");
  return `data:${type};base64,${bytes.toString("base64")}`;
}

const label = (text: string) =>
  `<div style="display:flex;font-size:20px;font-weight:700;color:#535B82;margin-bottom:14px">${text}</div>`;

const shareCard = (image: string, title: string, domain: string) =>
  `<div style="display:flex;flex-direction:column;width:540px;background:#ffffff;border:1px solid #D5DAEE;border-radius:14px;overflow:hidden">
    ${image}
    <div style="display:flex;flex-direction:column;justify-content:center;height:112px;padding:0 18px">
      <div style="display:flex;font-size:20px;font-weight:700;color:#11163A;line-height:1.25">${escapeText(title)}</div>
      <div style="display:flex;font-size:16px;color:#535B82;margin-top:6px">${domain}</div>
    </div>
  </div>`;

const blank = `<div style="display:flex;align-items:center;justify-content:center;width:540px;height:283px;background:#E7EAFA;color:#535B82;font-size:22px">No preview image</div>`;
const picture = (src: string) => `<img src="${src}" width="540" height="283" style="width:540px;height:283px;object-fit:cover"/>`;

const file = process.argv[2];
if (!file) throw new Error("Pass the path to a sites.json file");
const outDir = dirname(file);
mkdirSync(outDir, { recursive: true });

for (const site of JSON.parse(readFileSync(file, "utf8"))) {
  try {
    const logoUrl = await dataUri(site.logoUrl);
    const after = await render(buildOgHtml({ ...site, logoUrl, fontFamily: "Inter" }));
    writeFileSync(join(outDir, `${site.slug}-after.png`), after);

    const afterSrc = `data:image/png;base64,${after.toString("base64")}`;
    const before = site.beforeImage ? picture(await dataUri(site.beforeImage)) : blank;
    const composite = `<div style="display:flex;flex-direction:column;width:100%;height:100%;padding:36px 44px;background:#F3F5FC;font-family:Inter">
      <div style="display:flex;font-size:24px;font-weight:700;color:#11163A;margin-bottom:26px">${site.domain}${site.path}</div>
      <div style="display:flex;justify-content:space-between">
        <div style="display:flex;flex-direction:column">${label("Shared today")}${shareCard(before, site.beforeTitle, site.domain)}</div>
        <div style="display:flex;flex-direction:column">${label("Could look like")}${shareCard(picture(afterSrc), site.title, site.domain)}</div>
      </div>
    </div>`;
    writeFileSync(join(outDir, `${site.slug}-before-after.png`), await render(composite));
    console.log(`ok   ${site.slug}`);
  } catch (error) {
    // ponytail: one bad site never stops the batch, rerun after fixing its entry
    console.error(`FAIL ${site.slug}: ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
  }
}
