interface BuildTemplateInput {
  title: string;
  description: string;
  primaryColor: string;
  backgroundColor: string;
  logoUrl?: string;
  fontFamily?: string;
  watermark?: boolean;
}

// satori-html doesn't decode entities, so "&amp;" would print literally on the image.
// ponytail: "<" becomes a lookalike so page titles can't inject tags; a real "<" in a title renders slightly differently
export function escapeText(input: string): string {
  return input.replaceAll("<", "‹");
}

function escapeAttr(input: string): string {
  return input.replaceAll('"', "%22").replaceAll("<", "%3C");
}

// Inline styles and explicit flex everywhere: Satori ignores <style> blocks and classes, and Chromium renders this the same way.
export function buildOgHtml(input: BuildTemplateInput): string {
  const title = escapeText(input.title);
  const description = escapeText(input.description);
  const primary = escapeAttr(input.primaryColor);
  const background = escapeAttr(input.backgroundColor);
  const font = escapeAttr(input.fontFamily ?? "Inter, sans-serif");
  const logo = input.logoUrl
    ? `<img src="${escapeAttr(input.logoUrl)}" height="72" style="height:72px;max-width:380px;object-fit:contain"/>`
    : `<div style="display:flex"></div>`;
  const badge = input.watermark
    ? `<div style="display:flex;color:${primary};border:1px solid ${primary};border-radius:9999px;padding:8px 16px;font-size:18px">ogsnap.dev</div>`
    : "";
  // ponytail: two title sizes by length, no text measuring; very long titles can still crowd the logo
  const titleSize = input.title.length > 60 ? 60 : 78;

  return `<div style="display:flex;flex-direction:column;justify-content:space-between;width:100%;height:100%;padding:60px 64px;background:${background};color:white;border-bottom:18px solid ${primary};font-family:${font};position:relative;overflow:hidden">
  <div style="display:flex;position:absolute;right:-130px;top:-190px;width:560px;height:560px;border-radius:9999px;background:${primary};opacity:0.18"></div>
  <div style="display:flex;justify-content:space-between;align-items:center">${logo}${badge}</div>
  <div style="display:flex;flex-direction:column">
    <div style="display:flex;font-size:${titleSize}px;line-height:1.06;font-weight:700;letter-spacing:-0.02em">${title}</div>
    <div style="display:flex;margin-top:22px;color:rgba(255,255,255,0.82);font-size:30px;line-height:1.3;max-width:940px">${description}</div>
  </div>
</div>`;
}
