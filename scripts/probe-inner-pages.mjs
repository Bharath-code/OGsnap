// Usage: node scripts/probe-inner-pages.mjs urls.txt > inner.csv
// Qualifies sites whose inner pages (from sitemap.xml) show the homepage's og:image/og:title.
import { readFileSync } from "node:fs";

const T = 12000;
const get = async (url) => {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(T), headers: { "user-agent": "Mozilla/5.0 (compatible; OGSnapAudit/0.1)" } });
    return { status: r.status, url: r.url, body: (await r.text()).slice(0, 400_000) };
  } catch (e) {
    return { status: 0, url, body: "", err: e.cause?.code ?? e.message };
  }
};
const meta = (html, prop) => {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const t = m[0];
    if (new RegExp(`(?:property|name)=["']${prop}["']`, "i").test(t)) return (t.match(/content=["']([^"']*)["']/i) ?? [])[1] ?? "";
  }
  return "";
};
const csv = (row) => row.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(",");

async function probe(raw) {
  const home = await get(raw);
  if (!home.status || home.status >= 400) return [raw, "unreachable", home.err ?? home.status, "", "", "", ""];
  const origin = new URL(home.url).origin;
  const hImg = meta(home.body, "og:image"), hTitle = meta(home.body, "og:title");
  const sm = await get(`${origin}/sitemap.xml`);
  const locs = sm.status === 200 ? [...sm.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]) : [];
  const inner = locs.filter((u) => { try { const p = new URL(u); return p.origin === origin && p.pathname.length > 1; } catch { return false; } });
  const sample = inner.filter((_, i) => i % Math.max(1, Math.floor(inner.length / 2)) === 0).slice(0, 2);
  let same = 0, diff = 0;
  for (const u of sample) {
    const p = await get(u);
    if (p.status !== 200) continue;
    meta(p.body, "og:image") === hImg && meta(p.body, "og:title") === hTitle ? same++ : diff++;
  }
  const fake = await get(`${origin}/__ogsnap-probe-${Date.now() % 1e5}`);
  const spaFallback = fake.status === 200 && meta(fake.body, "og:image") === hImg && hImg !== "";
  const verdict = !hImg ? "home-missing" : inner.length < 3 ? "few-pages" : same > 0 && diff === 0 ? "QUALIFIES" : diff > 0 ? "per-page-ok" : "unverified";
  return [raw, verdict, inner.length, same, diff, spaFallback, sample[0] ?? ""];
}

const urls = readFileSync(process.argv[2], "utf8").split("\n").map((s) => s.trim()).filter(Boolean);
console.log(csv(["url", "verdict", "sitemap_inner_pages", "inner_same_as_home", "inner_different", "spa_fallback_200", "sample_inner_url"]));
let i = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < urls.length) console.log(csv(await probe(urls[i++])));
}));
