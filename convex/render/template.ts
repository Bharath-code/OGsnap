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

export function buildOgHtml(input: BuildTemplateInput): string {
  const safeTitle = escapeHtml(input.title);
  const safeDescription = escapeHtml(input.description);
  const logo = input.logoUrl
    ? `<img src="${escapeHtml(input.logoUrl)}" alt="logo" style="height:64px;max-width:220px;object-fit:contain"/>`
    : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        width: 1200px;
        height: 630px;
        font-family: ${input.fontFamily ?? "Inter, system-ui, sans-serif"};
        background: ${input.backgroundColor};
        color: white;
      }
      .root {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 56px;
        border: 2px solid ${input.primaryColor};
      }
      .title {
        font-size: 64px;
        line-height: 1.05;
        font-weight: 700;
        margin: 0;
      }
      .description {
        margin-top: 20px;
        color: rgba(255,255,255,0.9);
        font-size: 30px;
        line-height: 1.3;
        max-width: 900px;
      }
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
      }
      .badge {
        color: ${input.primaryColor};
        border: 1px solid ${input.primaryColor};
        border-radius: 9999px;
        padding: 8px 16px;
        font-size: 18px;
      }
    </style>
  </head>
  <body>
    <div class="root og-content">
      <div>
        <h1 class="title">${safeTitle}</h1>
        <p class="description">${safeDescription}</p>
      </div>
      <div class="footer">
        ${logo}
        ${input.watermark ? '<span class="badge">ogsnap.dev</span>' : ""}
      </div>
    </div>
  </body>
</html>`;
}
