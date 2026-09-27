// Usage: API_BASE_URL=https://<deployment>.convex.site INTERNAL_SERVICE_SECRET=... OGSNAP_USER_ID=... \
//          node --no-warnings scripts/before-after.ts <url | urls.txt>...   (PNGs land in OUT_DIR, default ./before-after)
//        node --no-warnings scripts/before-after.ts --self-test
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import assert from "node:assert/strict";
import { get, previewImage } from "./audit-previews.ts";

// ponytail: borrow the renderer's sharp instead of adding a root dependency
const sharp = createRequire(new URL("../apps/renderer/package.json", import.meta.url))("sharp");

const W = 1200, H = 630, PW = 560, PH = 294, PY = 240, LEFT = 27, RIGHT = W - 27 - PW;
const TIMEOUT_MS = 20_000;
const FONT = "Inter, Helvetica, Arial, sans-serif";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svg = (body: string, w = W, h = H) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);

const placeholder = () =>
  sharp(
    svg(
      `<rect width="${PW}" height="${PH}" rx="12" fill="#1E293B" stroke="#475569" stroke-dasharray="8 6"/>` +
        `<text x="${PW / 2}" y="${PH / 2 + 8}" text-anchor="middle" font-family="${FONT}" font-size="26" fill="#94A3B8">No preview image</text>`,
      PW,
      PH,
    ),
  ).png().toBuffer();

const panel = (img: Buffer) => sharp(img).resize(PW, PH, { fit: "cover" }).png().toBuffer();

export async function compose(before: Buffer | null, after: Buffer, host: string): Promise<Buffer> {
  const overlay = svg(
    `<text x="${W / 2}" y="112" text-anchor="middle" font-family="${FONT}" font-size="40" font-weight="700" fill="#F8FAFC">${esc(host)}: link preview</text>` +
      `<text x="${LEFT + PW / 2}" y="${PY - 22}" text-anchor="middle" font-family="${FONT}" font-size="26" fill="#94A3B8">Today</text>` +
      `<text x="${RIGHT + PW / 2}" y="${PY - 22}" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="700" fill="#38BDF8">With OGSnap</text>`,
  );
  const beforePanel = before ? await panel(before).catch(placeholder) : await placeholder();
  return sharp({ create: { width: W, height: H, channels: 4, background: "#0F172A" } })
    .composite([
      { input: overlay, left: 0, top: 0 },
      { input: beforePanel, left: LEFT, top: PY },
      { input: await panel(after), left: RIGHT, top: PY },
    ])
    .png()
    .toBuffer();
}

async function currentPreview(url: string): Promise<Buffer | null> {
  try {
    const { image } = await previewImage(url);
    if (!image) return null;
    const res = await get(image);
    return res.ok && res.headers.get("content-type")?.startsWith("image/") ? Buffer.from(await res.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

async function ogsnapPreview(url: string, signal: AbortSignal): Promise<Buffer> {
  const { API_BASE_URL, INTERNAL_SERVICE_SECRET, OGSNAP_USER_ID } = process.env;
  if (!API_BASE_URL || !INTERNAL_SERVICE_SECRET || !OGSNAP_USER_ID)
    throw new Error("API_BASE_URL, INTERNAL_SERVICE_SECRET and OGSNAP_USER_ID are required");

  const res = await fetch(`${API_BASE_URL}/v1/onboarding/magic`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-secret": INTERNAL_SERVICE_SECRET },
    body: JSON.stringify({ url, userId: OGSNAP_USER_ID }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`onboarding ${res.status}: ${(await res.text()).slice(0, 200)}`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) throw new Error("onboarding stream ended without a preview");
      buf += value;
      let cut: number;
      while ((cut = buf.indexOf("\n\n")) !== -1) {
        const raw = buf.slice(0, cut);
        buf = buf.slice(cut + 2);
        const event = raw.match(/^event: (.*)$/m)?.[1];
        const data = JSON.parse(raw.match(/^data: (.*)$/m)?.[1] ?? "{}");
        if (event === "error") throw new Error(data.message ?? "onboarding error");
        // index 0 is rendered with the site's own title
        if (event === "preview" && data.index === 0 && data.imageUrl) {
          const img = await fetch(data.imageUrl, { signal });
          if (!img.ok) throw new Error(`preview image ${img.status}`);
          return Buffer.from(await img.arrayBuffer());
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }
}

const slug = (url: string) => {
  const u = new URL(url);
  return (u.hostname + u.pathname).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
};

async function selfTest() {
  const red = await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#DC2626" } }).png().toBuffer();
  for (const before of [red, null, Buffer.from("not an image")]) {
    const meta = await sharp(await compose(before, red, "example.com")).metadata();
    assert.equal(meta.format, "png");
    assert.equal(meta.width, W);
    assert.equal(meta.height, H);
  }
  assert.equal(slug("https://Foo.lovable.app/pricing?x=1"), "foo-lovable-app-pricing");
  console.log("self-test ok");
}

if (!import.meta.main) {
  // imported as a module
} else if (process.argv[2] === "--self-test") {
  await selfTest();
} else {
  const urls = process.argv.slice(2).flatMap((a) =>
    existsSync(a) ? readFileSync(a, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")) : [a],
  );
  if (!urls.length) {
    console.error("Usage: node scripts/before-after.ts <url | urls.txt>...");
    process.exit(1);
  }
  const outDir = process.env.OUT_DIR ?? "before-after";
  mkdirSync(outDir, { recursive: true });

  let failed = 0;
  for (const url of urls) {
    const started = Date.now();
    try {
      const signal = AbortSignal.timeout(TIMEOUT_MS);
      const [before, after] = await Promise.all([currentPreview(url), ogsnapPreview(url, signal)]);
      const file = join(outDir, `${slug(url)}.png`);
      writeFileSync(file, await compose(before, after, new URL(url).hostname));
      console.log(`ok   ${url} -> ${file} (${Date.now() - started}ms${before ? "" : ", no current preview"})`);
    } catch (err) {
      failed++;
      console.error(`fail ${url}: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`${urls.length - failed}/${urls.length} done`);
}
