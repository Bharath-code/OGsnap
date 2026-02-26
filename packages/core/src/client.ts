import type { RenderRequest, RenderResponse } from "./types";

export interface OGSnapClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export class OGSnapClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: OGSnapClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://api.ogsnap.dev";
  }

  async render(input: RenderRequest): Promise<RenderResponse> {
    const response = await fetch(`${this.baseUrl}/v1/render`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Render failed (${response.status}): ${message}`);
    }

    return (await response.json()) as RenderResponse;
  }
}
