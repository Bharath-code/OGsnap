interface BuildTemplateInput {
  title: string;
  description: string;
  primaryColor: string;
  backgroundColor: string;
  logoUrl?: string;
  fontFamily?: string;
  watermark?: boolean;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Inline styles and explicit flex everywhere: Satori ignores <style> blocks and classes, and Chromium renders this the same way.
export function buildOgHtml(input: BuildTemplateInput): string {
  const title = escapeHtml(input.title);
  const description = escapeHtml(input.description);
  const primary = escapeHtml(input.primaryColor);
  const background = escapeHtml(input.backgroundColor);
  const font = escapeHtml(input.fontFamily ?? "Inter, sans-serif");
  const logo = input.logoUrl
    ? `<img src="${escapeHtml(input.logoUrl)}" height="64" style="height:64px;max-width:220px;object-fit:contain"/>`
    : `<div style="display:flex"></div>`;
  const badge = input.watermark
    ? `<div style="display:flex;color:${primary};border:1px solid ${primary};border-radius:9999px;padding:8px 16px;font-size:18px">ogsnap.dev</div>`
    : "";

  return `<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:56px;background:${background};color:white;border:2px solid ${primary};font-family:${font}">
  <div style="display:flex;flex-direction:column">
    <div style="display:flex;font-size:64px;line-height:1.05;font-weight:700">${title}</div>
    <div style="display:flex;margin-top:20px;color:rgba(255,255,255,0.9);font-size:30px;line-height:1.3;max-width:900px">${description}</div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center">${logo}${badge}</div>
</div>`;
}
