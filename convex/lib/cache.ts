export interface RenderCacheInput {
  apiKeyId: string;
  url: string;
  title?: string;
  description?: string;
  template?: string;
  width?: number;
  height?: number;
}

function stableHash(input: string): string {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildRenderCacheKey(input: RenderCacheInput): string {
  const digestInput = JSON.stringify({
    apiKeyId: input.apiKeyId,
    url: input.url,
    title: input.title ?? "",
    description: input.description ?? "",
    template: input.template ?? "default",
    width: input.width ?? 1200,
    height: input.height ?? 630,
  });
  return stableHash(digestInput);
}

export function monthBucket(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
