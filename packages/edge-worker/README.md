# @ogsnap/edge-cache

High-performance Cloudflare Worker that intercepts `/v1/render` API calls to perform sub-50ms cache lookups using Cloudflare KV.

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
