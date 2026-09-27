declare const HTMLRewriter: any;

interface Env {
  OGSNAP_CACHE: any;
  CONVEX_URL: string;
  // proxy mode: set SITE_ID to put this worker in front of a customer site
  SITE_ID?: string;
  // only when the worker is not a route on the site's own zone, e.g. my-app.lovable.app
  ORIGIN?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

// ponytail: per-isolate memory, so each isolate pings a path at most once per window; use KV if Convex load matters
const WARM_MS = 10 * 60 * 1000;
const warmedAt = new Map<string, number>();

async function proxy(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const upstream = env.ORIGIN ? new URL(url.pathname + url.search, env.ORIGIN) : url;
  const response = await fetch(new Request(upstream, request));

  if (request.method !== "GET" || !response.ok || !response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }

  const image = `${env.CONVEX_URL}/v1/site/${env.SITE_ID}/og.png?path=${encodeURIComponent(url.pathname)}`;

  // start the page render on the first human visit, so it is ready before the link is shared
  if (Date.now() - (warmedAt.get(url.pathname) ?? 0) > WARM_MS) {
    warmedAt.set(url.pathname, Date.now());
    ctx.waitUntil(fetch(image, { redirect: "manual" }).catch(() => undefined));
  }

  const seen = new Set<string>();
  const replace = (key: string) => ({
    element(el: any) {
      seen.add(key);
      el.setAttribute("content", image);
    },
  });

  return new HTMLRewriter()
    .on('meta[property="og:image"], meta[name="og:image"]', replace("og"))
    .on('meta[name="twitter:image"], meta[property="twitter:image"]', replace("twitter"))
    .on('meta[property^="og:image:"], meta[name^="twitter:image:"]', { element: (el: any) => el.remove() })
    .on('meta[name="twitter:card"], meta[property="twitter:card"]', { element: () => seen.add("card") })
    .on("head", {
      element(el: any) {
        el.onEndTag((end: any) => {
          const tags = [
            seen.has("og") ? "" : `<meta property="og:image" content="${image}">`,
            seen.has("twitter") ? "" : `<meta name="twitter:image" content="${image}">`,
            seen.has("card") ? "" : `<meta name="twitter:card" content="summary_large_image">`,
          ].join("");
          if (tags) end.before(tags, { html: true });
        });
      },
    })
    .transform(response);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (env.SITE_ID) return proxy(request, env, ctx);

    const urlObj = new URL(request.url);
    
    // Only intercept POST /v1/render requests
    if (request.method !== "POST" || urlObj.pathname !== "/v1/render") {
      return fetch(request);
    }

    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rawKey = authorization.replace("Bearer ", "").trim();
    
    // Hash the raw API key using Web Crypto
    const keyData = new TextEncoder().encode(rawKey);
    const keyHashBuffer = await crypto.subtle.digest("SHA-256", keyData);
    const keyHash = Array.from(new Uint8Array(keyHashBuffer), (b) =>
      b.toString(16).padStart(2, "0")
    ).join("");

    let body: any;
    try {
      body = await request.clone().json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    if (!body.url) {
      return new Response("url is required", { status: 400 });
    }

    // Compute the deterministic cache key
    const digestInput = JSON.stringify({
      apiKeyHash: keyHash,
      url: body.url,
      title: body.title ?? "",
      description: body.description ?? "",
      template: body.template ?? "default",
      width: body.width ?? 1200,
      height: body.height ?? 630,
    });

    const digestData = new TextEncoder().encode(digestInput);
    const digestBuffer = await crypto.subtle.digest("SHA-256", digestData);
    const cacheKey = Array.from(new Uint8Array(digestBuffer), (b) =>
      b.toString(16).padStart(2, "0")
    ).join("").slice(0, 16);

    // Attempt to retrieve from Cloudflare KV
    try {
      const cached = await env.OGSNAP_CACHE.get(cacheKey);
      if (cached) {
        const payload = JSON.parse(cached);
        return new Response(
          JSON.stringify({
            imageUrl: payload.imageUrl,
            cacheHit: true,
            renderTimeMs: payload.renderTimeMs,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "X-Cache": "HIT",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    } catch (err) {
      console.error("KV cache lookup error:", err);
    }

    // Forward the request to Convex on cache miss
    const response = await fetch(`${env.CONVEX_URL}/v1/render`, request);
    if (response.ok) {
      try {
        const clonedResponse = response.clone();
        const result = (await clonedResponse.json()) as { imageUrl: string; renderTimeMs: number };
        
        // Save the result to KV with a 7-day TTL
        await env.OGSNAP_CACHE.put(
          cacheKey,
          JSON.stringify({
            imageUrl: result.imageUrl,
            renderTimeMs: result.renderTimeMs,
          }),
          { expirationTtl: 7 * 24 * 60 * 60 }
        );
      } catch (err) {
        console.error("Failed to write to KV cache:", err);
      }
    }

    return response;
  },
};
