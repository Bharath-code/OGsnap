import { OGSnapClient, type RenderRequest } from "@ogsnap/core";

export interface OGEndpointOptions {
  apiKey: string;
  baseUrl?: string;
  defaultTemplate?: string;
}

interface AstroLikeContext {
  request: Request;
  url: URL;
}

export function OGEndpoint(options: OGEndpointOptions) {
  const client = new OGSnapClient({ apiKey: options.apiKey, baseUrl: options.baseUrl });

  async function GET(context: AstroLikeContext) {
    const url = context.url.searchParams.get("url") ?? context.url.origin;

    const payload: RenderRequest = {
      url,
      title: context.url.searchParams.get("title") ?? undefined,
      description: context.url.searchParams.get("description") ?? undefined,
      template: options.defaultTemplate,
    };

    const result = await client.render(payload);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return { GET };
}
