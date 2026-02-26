import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { url?: string };

  if (!body.url) {
    return new Response("url is required", { status: 400 });
  }

  const apiBase = process.env.API_BASE_URL ?? "http://127.0.0.1:3210";
  const apiKey = process.env.OGSNAP_DEMO_KEY;

  if (!apiKey) {
    return new Response("OGSNAP_DEMO_KEY is missing", { status: 500 });
  }

  const response = await fetch(`${apiBase}/v1/render`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: body.url,
      title: "OGSnap Demo Render",
      description: "First end-to-end render from Next.js demo",
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    return new Response(text, { status: response.status });
  }

  return new Response(text, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
