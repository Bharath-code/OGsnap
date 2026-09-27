import type { PreviewCheck } from "@ogsnap/core/preview-audit";
import type { DashboardSite } from "@/lib/dashboard-live";

export type Tone = "ok" | "warn" | "bad";
export type CheckLine = { text: string; tone?: Tone | "dim" };

// Turns an /api/check result into what the site owner should do next.
export function readCheck(r: PreviewCheck, site: DashboardSite): { lines: CheckLine[]; tone: Tone } {
  const ours = Boolean(r.image?.includes(`/v1/site/${site.id}/og.png`));
  const lines: CheckLine[] = [
    { text: `GET https://${site.domain}/ as a social crawler`, tone: "dim" },
    { text: `og:image → ${r.image ?? "none"}`, tone: r.image ? (ours ? "ok" : "warn") : "bad" },
  ];
  if (r.width && r.height) lines.push({ text: `image ${r.width} × ${r.height}`, tone: "ok" });

  if (r.verdict === "ok" && ours) return { lines: [...lines, { text: "Your preview is live.", tone: "ok" }], tone: "ok" };
  if (r.verdict === "ok") {
    return { lines: [...lines, { text: "Your site has its own og:image. Replace it with the lines above, publish, then check again.", tone: "warn" }], tone: "warn" };
  }
  const next: Record<Exclude<PreviewCheck["verdict"], "ok">, string> = {
    missing: `We didn't find an og:image tag on ${site.domain}. Paste the lines above, publish, then check again.`,
    generic: "Your og:image still points to a default image. On Lovable, paste the prompt again and publish.",
    broken: `The page or image didn't load (${r.imageStatus || "no response"}). Make sure the site is published.`,
    unknown: "Your site blocked our crawler, so social networks may be blocked too. Check your host's bot protection.",
  };
  return { lines: [...lines, { text: next[r.verdict], tone: "bad" }], tone: "bad" };
}
