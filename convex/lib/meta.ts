// Shared by convex/sites (per-page titles) and scripts/audit-previews.ts; keep it plain TS so Node can strip types
export const decodeEntities = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

export function parseMeta(html: string): Map<string, string> {
  const meta = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = Object.fromEntries(
      [...tag.matchAll(/([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => [m[1].toLowerCase(), m[2] ?? m[3]]),
    );
    const key = (attrs.property ?? attrs.name)?.toLowerCase();
    if (key && attrs.content !== undefined && !meta.has(key)) meta.set(key, decodeEntities(attrs.content));
  }
  return meta;
}

export function pageTitle(html: string): string | undefined {
  const fromMeta = parseMeta(html).get("og:title");
  const fromTag = html.match(/<title\b[^>]*>([^<]*)<\/title>/i)?.[1];
  return (fromMeta ?? (fromTag && decodeEntities(fromTag)))?.trim() || undefined;
}

// "/blog/my-first-post" -> "My First Post"; used when an SPA serves one <title> for every route
export const titleFromPath = (path: string) =>
  decodeURIComponent(path.split("/").filter(Boolean).pop() ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
