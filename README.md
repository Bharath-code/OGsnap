# OGSnap MVP Scaffold

This repository contains the v1 MVP scaffold defined in `docs/00-V1-DOC-CONSOLIDATION.md`.

## Workspaces

- `apps/web`: Next.js app (marketing + dashboard shell)
- `apps/renderer`: Playwright rendering microservice
- `convex`: Convex backend (schema, queries, mutations, actions, HTTP)
- `packages/core`: Shared types and API client
- `packages/next`: `@ogsnap/next` SDK scaffold
- `packages/astro`: `@ogsnap/astro` SDK scaffold

## Next steps

1. `pnpm install`
2. `pnpm dev:convex`
3. `pnpm dev:renderer`
4. `pnpm dev:web`

## Minimum env for local end-to-end

Set these in root `.env` and `apps/web/.env.local`:

- `NEXT_PUBLIC_CONVEX_URL`
- `INTERNAL_SERVICE_SECRET`
- `DEV_BOOTSTRAP_SECRET`
- `RENDERER_SERVICE_URL`
- `RENDERER_INTERNAL_TOKEN` (optional)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` (for auth-enabled mode)

For billing and onboarding extraction:

- `DODO_API_KEY`, `DODO_*_PRICE_ID`
- `DODO_WEBHOOK_SECRET`
- `FIRECRAWL_API_KEY`

## Production hardening commands

1. Validate env before deploy:
   - `pnpm preflight:prod`
2. Generate Convex typed API against target deployment:
   - `pnpm convex:codegen`
3. Ensure Convex generated files are not scaffold stubs:
   - `pnpm convex:codegen:check`
4. Run deploy smoke test (against deployed API):
   - `pnpm smoke:deploy`

Required env for smoke script:

- `API_BASE_URL`
- `OGSNAP_SMOKE_API_KEY`

Optional extra smoke coverage:

- `INTERNAL_SERVICE_SECRET` (enables `/v1/internal/sync-user` smoke)
- `SMOKE_ONBOARDING_URL` (enables `/v1/onboarding/magic` smoke)

## MCP setup (Convex, Firecrawl, Dodo, Cloudflare/R2)

1. Copy MCP env template:
   - `cp .env.mcp.example .env.mcp`
2. Fill `.env.mcp` (at minimum: `FIRECRAWL_API_KEY`, and Convex values if needed).
3. Use the repo MCP config:
   - `mcp.json`

Server notes:

- `convex`: local CLI MCP (`convex mcp start`) using `.env.mcp`
- `firecrawl`: remote MCP via `mcp-remote` + `.env.mcp` (`FIRECRAWL_API_KEY`)
- `dodopayments`: remote MCP (`https://mcp.dodopayments.com/sse`) via OAuth
- `cloudflare-api` (includes R2 APIs): remote MCP (`https://mcp.cloudflare.com/mcp`) via OAuth
