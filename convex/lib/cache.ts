export interface RenderCacheInput {
  apiKeyId: string;
  url: string;
  title?: string;
  description?: string;
  template?: string;
  width?: number;
  height?: number;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function buildRenderCacheKey(input: RenderCacheInput): Promise<string> {
  const digestInput = JSON.stringify({
    apiKeyId: input.apiKeyId,
    url: input.url,
    title: input.title ?? "",
    description: input.description ?? "",
    template: input.template ?? "default",
    width: input.width ?? 1200,
    height: input.height ?? 630,
  });
  const hash = await sha256Hex(digestInput);
  return hash.slice(0, 16);
}

export function monthBucket(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
