export type Plan = "free" | "hobby" | "pro" | "scale";

export interface RenderRequest {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  template?: string;
  width?: number;
  height?: number;
}

export interface RenderResponse {
  imageUrl: string;
  cacheHit: boolean;
  renderTimeMs: number;
}

export interface BrandExtractionResult {
  logoUrl?: string;
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
}
