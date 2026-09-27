# @ogsnap/edge-cache

Cloudflare Worker with two modes:

- **Render cache** (default): intercepts `/v1/render` API calls for KV cache lookups.
- **Proxy** (`SITE_ID` set): sits in front of a customer site and gives every page its own preview image.

## Proxy mode (per-page previews)

For HTML responses, `og:image` and `twitter:image` are replaced (or inserted, plus `twitter:card` if missing) with
`{CONVEX_URL}/v1/site/{SITE_ID}/og.png?path={pathname}`. Stale `og:image:*` tags are removed. Everything else (JS, CSS, images, non-200s) passes through untouched.

- The page title comes from the page's `og:title` or `<title>`, fetched by OGSnap itself, never from the request. SPAs that reuse the homepage title on every route get a title derived from the path.
- The first visit to a new path queues its render. Until the render is ready, crawlers get the site-wide image.
- Up to 200 distinct paths per site.

Setup: set `SITE_ID` (and `ORIGIN` only if the domain is not proxied through its own Cloudflare zone), then either add a route such as `example.com/*`, or attach the worker as a custom domain.

Measured with `wrangler dev` against a local origin (20 requests, 71 KB page): HTML p50 went from 2.6 ms direct to 6–8 ms through the worker, so about 5 ms of added overhead.

## Deployment Instructions

### 1. Initialize Cloudflare KV Namespace
Create the KV namespace for caching image metadata and cache responses:
```bash
npx wrangler kv:namespace create OGSNAP_CACHE
```

This command will output two configuration blocks, one for local development and one for production. Example output:
```toml
[[kv_namespaces]]
binding = "OGSNAP_CACHE"
id = "a1b2c3d4e5f6g7h8..."
```

### 2. Configure `wrangler.toml`
Update your `packages/edge-worker/wrangler.toml` file with your unique KV namespace ID and your live Convex production URL:

```toml
name = "ogsnap-edge-cache"
main = "index.ts"
compatibility_date = "2026-06-15"

[vars]
CONVEX_URL = "https://your-production-app.convex.site"

[[kv_namespaces]]
binding = "OGSNAP_CACHE"
id = "insert-your-kv-namespace-id-here"
```

### 3. Deploy to Cloudflare
Log in to your Cloudflare account and deploy the worker:
```bash
npx wrangler login
npx wrangler deploy
```

Once deployed, point your client SDK requests or server rendering endpoints to the worker's URL instead of the direct Convex URL (e.g. `https://ogsnap-edge-cache.<your-subdomain>.workers.dev/v1/render`) to benefit from sub-50ms global cache lookups.
