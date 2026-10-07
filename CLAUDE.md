# OGSnap

Social-preview autopilot for sites built with no-code and vibe-coding tools: paste a URL, get a branded preview image per site, per page. Billing is per site: Site $9/mo, Agency $49/mo for 10 sites.

## Where things are
- `tasks/plan.md`, `tasks/todo.md`: the 30-day validation plan, tasks with acceptance criteria, Decision log. **Source of truth for what to do next.**
- `.claudedocs/launch-runbook.md`: deploy steps and commands. `.claudedocs/outreach/`: prospect audits, DM templates, tracker. `.claudedocs/strategy-review-2026-09.md`: why the pivot.
- `docs/` is the older v1 doc set (28 files); do not add to it, parts are stale.

## Layout
- `apps/web` Next.js (landing, `/check`, dashboard; Clerk auth) · rendering is `POST /api/render` in `apps/web` (Satori + resvg → R2; bearer `RENDERER_INTERNAL_TOKEN`) · `apps/renderer` legacy Fastify + Playwright, kept as the Chromium option, not deployed · `convex` backend (schema, HTTP routes, billing, sites) · `packages/core` shared logic (preview audit, meta parsing, agency limits) · `packages/edge-worker` Cloudflare Worker proxy · `scripts/` audits and checks.

## Commands
- Use Node 22: `export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"` (machine default Node 26 breaks the Convex CLI).
- `pnpm install` · `pnpm typecheck` · `pnpm test` · `pnpm build` (CI runs typecheck and build).
- `pnpm dev:convex | dev:web` (local `RENDERER_SERVICE_URL=http://localhost:3000/api`) · `pnpm preflight:local | preflight:prod` · `pnpm smoke:deploy` · `pnpm convex:codegen` then `pnpm convex:codegen:check`.
- Convex CLI runs from `convex/`. After `convex dev --configure`, restore `convex/README.md` and `convex/tsconfig.json` if overwritten.
- Scripts: `node --no-warnings scripts/audit-previews.ts urls.txt`, `node scripts/probe-inner-pages.mjs urls.txt`, `scripts/before-after.ts` (needs a deployed backend).

## Deployments
- Convex project `ogsnap`: dev `different-cobra-393`, prod `fearless-gazelle-27` (`.convex.cloud` client, `.convex.site` HTTP/webhooks). Nothing else is deployed yet (see Phase L in `tasks/todo.md`).
- Billing: Dodo Payments. `DODO_ENVIRONMENT=live_mode` for real charges, otherwise test mode. Only `subscription.active|renewed|cancelled` webhooks are handled today.

## Rules for this repo
- Convex functions that take a user id must derive it from `ctx.auth` or be `internal`; never trust a caller-supplied `userId` (8 such holes were fixed, keep it that way).
- One price table: `apps/web/src/lib/pricing.ts` (`PLAN_PRICES`). No claims on the landing page for frameworks or features that are not shipped.
- Never commit secrets; `.env`, `.env.local`, `.env.mcp` are ignored. `DEV_BOOTSTRAP_SECRET` must not be set in production.
- Render templates (`convex/render/template.ts`) must stay Satori-valid: inline styles only, `display:flex` on every div (even empty ones), no `<style>`/classes, no whitespace text between tags.
- Do not touch `convex/_generated/`; regenerate with `pnpm convex:codegen`.
- Mark deliberate shortcuts with a `// ponytail:` comment naming the ceiling.
- A task is done only when its acceptance criteria in `tasks/todo.md` are met with evidence; tick the box and note blockers inline.
- Claude reports and research go in `.claudedocs/`, not `docs/`.

## Working agreements
- Goal until the day-30 gate: ≥5 paying customers. If below that, open-source the renderer and brand pipeline and archive.
- No new features unless a prospect asked for one. Selling beats polishing: after Checkpoint L the priority is sending DMs, not code.
- Do not merge or push to `main` without the owner saying so; PRs from branches, CI job `checks` must pass (the Kilo review check fails for billing reasons, ignore it).
