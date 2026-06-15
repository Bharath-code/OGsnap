import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";

let fontBuffer: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer> {
  if (fontBuffer) return fontBuffer;
  
  // Fetch a standard Roboto TTF font from a reliable public CDN
  const fontUrl = "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/Roboto-Regular.ttf";
  const res = await fetch(fontUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch font for Satori: ${res.statusText}`);
  }
  
  fontBuffer = await res.arrayBuffer();
  return fontBuffer;
}

export async function renderWithSatori(options: {
  htmlContent: string;
  width: number;
  height: number;
}): Promise<Buffer> {
  const font = await getFont();
  
  // Satori parses HTML and CSS into React-like VDOM elements
  const vdom = html(options.htmlContent);
  
  const svg = await satori(vdom as any, {
    width: options.width,
    height: options.height,
    fonts: [
      {
        name: "Roboto",
        data: font,
        weight: 400,
        style: "normal",
      },
    ],
  });
  
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: options.width,
    },
  });
  
  const pngData = resvg.render();
  return pngData.asPng();
}
