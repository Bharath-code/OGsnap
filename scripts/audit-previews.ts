// Usage: node scripts/audit-previews.ts urls.txt > audit.csv
//        node scripts/audit-previews.ts --self-test
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { parseMeta } from "../convex/lib/meta.ts";

type Verdict = "missing" | "broken" | "generic" | "ok" | "unknown";

// ponytail: fetch as a social crawler so we see what X/LinkedIn/Slack see, not what a browser sees
const UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const TIMEOUT_MS = 10_000;

// ponytail: hand-kept list of known platform stock images; extend as outreach finds more
const PLATFORM_DEFAULTS = [/lovable\.dev\/opengraph-image/i, /gptengineer/i];

export function guessPlatform(html: string, host: string, headers: Headers): string {
  const gen = parseMeta(html).get("generator")?.toLowerCase() ?? "";
  const server = headers.get("server")?.toLowerCase() ?? "";
  if (/framer\.(app|website)$/.test(host) || gen.includes("framer") || server.includes("framer")) return "framer";
  if (/webflow\.io$/.test(host) || gen.includes("webflow") || html.includes("data-wf-site")) return "webflow";
  if (/lovable\.app$/.test(host) || /cdn\.gpteng\.co|lovable-tagger|lovable\.app\//i.test(html)) return "lovable";
  if (html.includes("framerusercontent.com")) return "framer";
  return "other";
}

export function imageSize(b: Buffer): { width: number; height: number } | null {
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.length >= 10 && b.toString("ascii", 0, 3) === "GIF") return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  if (b.length >= 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L")
      return { width: 1 + (((b[22] & 0x3f) << 8) | b[21]), height: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)) };
    if (chunk === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
  }
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      if (marker === 0xff) { i++; continue; }
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

export function classify(p: { image?: string; imageOk: boolean; homepageImage?: string; isHomepage: boolean }): Verdict {
  if (!p.image) return "missing";
  if (!p.imageOk) return "broken";
  if (PLATFORM_DEFAULTS.some((re) => re.test(p.image!))) return "generic";
  if (!p.isHomepage && p.image === p.homepageImage) return "generic";
  return "ok";
}

const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const fetchAs = (url: string, ua: string) =>
  fetch(url, { headers: { "User-Agent": ua }, redirect: "follow", signal: AbortSignal.timeout(TIMEOUT_MS) });

// ponytail: bot filters 403 a spoofed crawler UA from our IP; real crawlers pass, so retry as a browser
export async function get(url: string) {
  const res = await fetchAs(url, UA);
  return res.status === 403 ? fetchAs(url, BROWSER_UA) : res;
}

export async function previewImage(url: string) {
  const res = await get(url);
  const html = res.ok ? await res.text() : "";
  const meta = parseMeta(html);
  const raw = meta.get("og:image") ?? meta.get("twitter:image") ?? meta.get("twitter:image:src");
  return { res, html, meta, image: raw ? new URL(raw, res.url || url).href : undefined };
}

async function audit(url: string): Promise<string[]> {
  const page = await previewImage(url);
  if ([403, 429].includes(page.res.status)) return [url, "", "", `page ${page.res.status} bot-blocked`, "", "", "", "unknown"];
  if (!page.res.ok) throw new Error(`page ${page.res.status}`);
  const u = new URL(page.res.url || url);
  const isHomepage = u.pathname === "/" || u.pathname === "";
  const homepageImage = isHomepage ? page.image : await previewImage(u.origin).then((h) => h.image, () => undefined);

  let imageStatus = "";
  let size: { width: number; height: number } | null = null;
  if (page.image) {
    try {
      const img = await get(page.image);
      imageStatus = String(img.status);
      if (img.ok && img.headers.get("content-type")?.startsWith("image/")) size = imageSize(Buffer.from(await img.arrayBuffer()));
      else if (img.ok) imageStatus = `${img.status} non-image`;
    } catch (err) {
      imageStatus = err instanceof Error ? err.name : "error";
    }
  }

  const verdict = classify({ image: page.image, imageOk: imageStatus === "200", homepageImage, isHomepage });
  return [
    url,
    guessPlatform(page.html, u.hostname, page.res.headers),
    String(Boolean(page.image)),
    imageStatus,
    String(size?.width ?? ""),
    String(size?.height ?? ""),
    String(page.meta.has("og:title")),
    verdict,
  ];
}

const csv = (row: string[]) => row.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",");

function selfTest() {
  const png = Buffer.alloc(24);
  png.writeUInt32BE(0x89504e47, 0);
  png.writeUInt32BE(1200, 16);
  png.writeUInt32BE(630, 20);
  assert.deepEqual(imageSize(png), { width: 1200, height: 630 });

  const gif = Buffer.from("GIF89a\x10\x00\x20\x00", "latin1");
  assert.deepEqual(imageSize(gif), { width: 16, height: 32 });

  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0, 0, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0x76, 0x04, 0xb0, 0x03]);
  assert.deepEqual(imageSize(jpg), { width: 1200, height: 630 });

  const meta = parseMeta(`<meta content="https://x.com/a.png?a=1&amp;b=2" property="og:image"><meta name='og:title' content='Hi'>`);
  assert.equal(meta.get("og:image"), "https://x.com/a.png?a=1&b=2");
  assert.equal(meta.get("og:title"), "Hi");

  assert.equal(classify({ imageOk: false, isHomepage: true }), "missing");
  assert.equal(classify({ image: "https://a/x.png", imageOk: false, isHomepage: true }), "broken");
  assert.equal(classify({ image: "https://lovable.dev/opengraph-image-p98pqg.png", imageOk: true, isHomepage: true }), "generic");
  assert.equal(classify({ image: "https://a/x.png", imageOk: true, homepageImage: "https://a/x.png", isHomepage: false }), "generic");
  assert.equal(classify({ image: "https://a/x.png", imageOk: true, homepageImage: "https://a/x.png", isHomepage: true }), "ok");
  console.log("self-test ok");
}

if (import.meta.main) {
  const arg = process.argv[2];
  if (arg === "--self-test") {
    selfTest();
  } else if (!arg) {
    console.error("Usage: node scripts/audit-previews.ts <urls.txt>");
    process.exit(1);
  } else {
    const urls = readFileSync(arg, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
    console.log("url,platform_guess,has_og_image,image_status,width,height,has_og_title,verdict");
    for (const url of urls) {
      try {
        console.log(csv(await audit(url)));
      } catch (err) {
        console.log(csv([url, "", "false", err instanceof Error ? err.message : "error", "", "", "false", "broken"]));
      }
    }
  }
}
