# Convex Backend (v1 scaffold)

## Key routes

- `POST /v1/render` - generate/render OG image via renderer service
- `POST /webhooks/dodo` - DodoPayments webhook endpoint
- `POST /v1/dev/bootstrap` - dev-only helper to mint a user + API key
- `POST /v1/internal/sync-user` - internal Clerk identity -> Convex user sync
- `POST /v1/onboarding/magic` - internal magic onboarding persistence

## Required env vars

- `RENDERER_SERVICE_URL`
- `RENDERER_INTERNAL_TOKEN` (optional but recommended)
- `DODO_WEBHOOK_SECRET`
- `DEV_BOOTSTRAP_SECRET`
- `INTERNAL_SERVICE_SECRET` (used by the web app for onboarding persistence)
- `FIRECRAWL_API_KEY` (for magic onboarding extraction)

## Release checks

1. `pnpm --filter @ogsnap/convex exec convex codegen`
2. `pnpm convex:codegen:check`
3. `pnpm --filter @ogsnap/convex deploy`

## Demo bootstrapping

1. Call `POST /v1/dev/bootstrap` with `x-bootstrap-secret` header
2. Copy returned `apiKey` into `apps/web/.env.local` as `OGSNAP_DEMO_KEY`
3. Use homepage demo to trigger `/v1/render`
