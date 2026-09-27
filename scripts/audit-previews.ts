// Usage: node scripts/audit-previews.ts urls.txt > audit.csv
//        node scripts/audit-previews.ts --self-test
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { parseMeta } from "../packages/core/src/meta.ts";
import { checkPreview, classify, imageSize, isPublicUrl } from "../packages/core/src/preview-audit.ts";

async function audit(url: string): Promise<string[]> {
  const r = await checkPreview(url);
  const known = r.verdict !== "unknown";
  return [
    url,
    r.platform,
    known ? String(Boolean(r.image)) : "",
    r.imageStatus,
    String(r.width ?? ""),
    String(r.height ?? ""),
    known ? String(r.hasOgTitle) : "",
    r.verdict,
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
  assert.equal(isPublicUrl("https://example.com/a"), true);
  assert.equal(isPublicUrl("https://1.1.1.1/"), true);
  for (const bad of ["http://localhost:3000", "http://127.0.0.1", "http://10.0.0.5", "http://169.254.169.254/latest",
    "http://192.168.1.1", "http://172.20.0.1", "http://[::1]/", "http://2130706433/", "file:///etc/passwd", "http://db.internal"])
    assert.equal(isPublicUrl(bad), false, bad);
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
