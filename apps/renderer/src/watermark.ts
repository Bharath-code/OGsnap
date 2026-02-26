import sharp from "sharp";

export async function applyWatermark(imageBuffer: Buffer, text = "ogsnap.dev"): Promise<Buffer> {
  const watermarkSvg = `
    <svg width="1200" height="630">
      <text x="1170" y="608" font-size="20" font-family="Inter, sans-serif" text-anchor="end" fill="white" fill-opacity="0.55">${text}</text>
    </svg>
  `;

  return await sharp(imageBuffer)
    .composite([{ input: Buffer.from(watermarkSvg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}
