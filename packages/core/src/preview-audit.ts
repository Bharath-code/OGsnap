// Shared by scripts/audit-previews.ts (CLI) and apps/web /api/check; server-only (fetches arbitrary URLs), keep out of index.ts
import { pageTitle, parseMeta } from "./meta.ts";

export type Verdict = "missing" | "broken" | "generic" | "ok" | "unknown";

export type PreviewCheck = {
  url: string;
  platform: string;
  image?: string;
  imageStatus: string;
  width?: number;
  height?: number;
  title?: string;
  hasOgTitle: boolean;
  description?: string;
  siteName?: string;
  verdict: Verdict;
};

// ponytail: fetch as a social crawler so we see what X/LinkedIn/Slack see, not what a browser sees
const UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;

// ponytail: hand-kept list of known platform stock images; extend as outreach finds more
const PLATFORM_DEFAULTS = [/lovable\.dev\/opengraph-image/i, /gptengineer/i];

// ponytail: blocks literal private IPs and local names only; a public hostname that resolves to a private IP
// still gets through. Add a dns.lookup check here if /api/check ever runs next to internal services
export function isPublicUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  if (host.startsWith("[") || host === "localhost" || /\.(localhost|local|internal)$/.test(host)) return false;
  const ip = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)?.slice(1).map(Number);
  if (!ip) return !/^\d+$/.test(host);
  const [a, b] = ip;
  return !(a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224);
}

export function guessPlatform(html: string, host: string, headers: Headers): string {
  const gen = parseMeta(html).get("generator")?.toLowerCase() ?? "";
  const server = headers.get("server")?.toLowerCase() ?? "";
  if (/framer\.(app|website)$/.test(host) || gen.includes("framer") || server.includes("framer")) return "framer";
  if (/webflow\.io$/.test(host) || gen.includes("webflow") || html.includes("data-wf-site")) return "webflow";
  if (/lovable\.app$/.test(host) || /cdn\.gpteng\.co|lovable-tagger|lovable\.app\//i.test(html)) return "lovable";
  if (html.includes("framerusercontent.com")) return "framer";
  return "other";
}

const ascii = (b: Uint8Array, start: number, end: number) => String.fromCharCode(...b.subarray(start, end));

export function imageSize(b: Uint8Array): { width: number; height: number } | null {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (b.length >= 24 && v.getUint32(0) === 0x89504e47) return { width: v.getUint32(16), height: v.getUint32(20) };
  if (b.length >= 10 && ascii(b, 0, 3) === "GIF") return { width: v.getUint16(6, true), height: v.getUint16(8, true) };
  if (b.length >= 30 && ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP") {
    const chunk = ascii(b, 12, 16);
    if (chunk === "VP8 ") return { width: v.getUint16(26, true) & 0x3fff, height: v.getUint16(28, true) & 0x3fff };
    if (chunk === "VP8L")
      return { width: 1 + (((b[22] & 0x3f) << 8) | b[21]), height: 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)) };
    if (chunk === "VP8X") return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
  }
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      if (marker === 0xff) { i++; continue; }
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
        return { width: v.getUint16(i + 7), height: v.getUint16(i + 5) };
      i += 2 + v.getUint16(i + 2);
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

// Follows redirects by hand so every hop is checked against isPublicUrl
async function fetchAs(url: string, ua: string): Promise<{ res: Response; url: string }> {
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!isPublicUrl(url)) throw new Error("blocked address");
    const res = await fetch(url, { headers: { "User-Agent": ua }, redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS) });
    const next = res.headers.get("location");
    if (res.status < 300 || res.status >= 400 || !next) return { res, url };
    await res.body?.cancel();
    url = new URL(next, url).href;
  }
  throw new Error("too many redirects");
}

// ponytail: bot filters 403 a spoofed crawler UA from our IP; real crawlers pass, so retry as a browser
export async function get(url: string) {
  const first = await fetchAs(url, UA);
  if (first.res.status !== 403) return first;
  await first.res.body?.cancel();
  return fetchAs(url, BROWSER_UA);
}

export async function previewImage(url: string) {
  const { res, url: finalUrl } = await get(url);
  const html = res.ok ? await res.text() : "";
  const meta = parseMeta(html);
  const raw = meta.get("og:image") ?? meta.get("twitter:image") ?? meta.get("twitter:image:src");
  return { res, finalUrl, html, meta, image: raw ? new URL(raw, finalUrl).href : undefined };
}

// Throws on a non-2xx page (other than bot blocks); callers report that as "broken"
export async function checkPreview(url: string): Promise<PreviewCheck> {
  const page = await previewImage(url);
  if ([403, 429].includes(page.res.status))
    return { url, platform: "", imageStatus: `page ${page.res.status} bot-blocked`, hasOgTitle: false, verdict: "unknown" };
  if (!page.res.ok) throw new Error(`page ${page.res.status}`);
  const u = new URL(page.finalUrl);
  const isHomepage = u.pathname === "/" || u.pathname === "";
  const homepageImage = isHomepage ? page.image : await previewImage(u.origin).then((h) => h.image, () => undefined);

  let imageStatus = "";
  let size: { width: number; height: number } | null = null;
  if (page.image) {
    try {
      const { res: img } = await get(page.image);
      imageStatus = String(img.status);
      if (img.ok && img.headers.get("content-type")?.startsWith("image/")) size = imageSize(new Uint8Array(await img.arrayBuffer()));
      else if (img.ok) imageStatus = `${img.status} non-image`;
    } catch (err) {
      imageStatus = err instanceof Error ? err.name : "error";
    }
  }

  return {
    url,
    platform: guessPlatform(page.html, u.hostname, page.res.headers),
    image: page.image,
    imageStatus,
    width: size?.width,
    height: size?.height,
    title: pageTitle(page.html) ?? page.meta.get("twitter:title"),
    hasOgTitle: page.meta.has("og:title"),
    description: page.meta.get("og:description") ?? page.meta.get("twitter:description") ?? page.meta.get("description"),
    siteName: page.meta.get("og:site_name"),
    verdict: classify({ image: page.image, imageOk: imageStatus === "200", homepageImage, isHomepage }),
  };
}
