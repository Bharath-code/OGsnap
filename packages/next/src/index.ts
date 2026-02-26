import { OGSnapClient, type RenderRequest } from "@ogsnap/core";

export interface GenerateOGOptions {
  apiKey: string;
  baseUrl?: string;
  defaultTemplate?: string;
}

export function generateOG(options: GenerateOGOptions) {
  const client = new OGSnapClient({ apiKey: options.apiKey, baseUrl: options.baseUrl });

  async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const pageUrl = requestUrl.searchParams.get("url") ?? requestUrl.origin;

    const payload: RenderRequest = {
      url: pageUrl,
      title: requestUrl.searchParams.get("title") ?? undefined,
      description: requestUrl.searchParams.get("description") ?? undefined,
      template: options.defaultTemplate,
    };

    const result = await client.render(payload);

    return Response.json(result, {
      headers: {
        "Cache-Control": result.cacheHit
          ? "public, max-age=300, stale-while-revalidate=3600"
          : "no-store",
      },
    });
  }

  return { GET };
}
