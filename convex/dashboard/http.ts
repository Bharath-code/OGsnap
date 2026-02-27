import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

interface DashboardBody {
  clerkId?: unknown;
  apiKeyLimit?: unknown;
  renderLimit?: unknown;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function optionalPositiveInt(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) return undefined;
  if (value <= 0) return undefined;
  return value;
}

export const getDashboardData = httpAction(async (ctx, request) => {
  const secret = process.env.INTERNAL_SERVICE_SECRET;
  if (!secret) {
    return new Response("INTERNAL_SERVICE_SECRET is not configured", { status: 500 });
  }

  if (request.headers.get("x-internal-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: DashboardBody;
  try {
    body = (await request.json()) as DashboardBody;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const clerkId = optionalString(body.clerkId);
  if (!clerkId) {
    return new Response("clerkId is required", { status: 400 });
  }

  const user = await ctx.runQuery(api.users.queries.getByClerkId, { clerkId });
  if (!user) {
    return new Response("User not found for clerkId", { status: 404 });
  }

  const userId = user._id as Id<"users">;
  const apiKeyLimit = Math.min(optionalPositiveInt(body.apiKeyLimit) ?? 50, 200);
  const renderLimit = Math.min(optionalPositiveInt(body.renderLimit) ?? 25, 100);

  const [keys, renders, usage] = await Promise.all([
    ctx.runQuery(api.apiKeys.queries.listByUser, { userId }),
    ctx.runQuery(api.render.queries.listRecentByUser, { userId, limit: renderLimit }),
    ctx.runQuery(api.usage.queries.getUsageForCurrentMonth, { userId }),
  ]);

  const visibleKeys = keys
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, apiKeyLimit)
    .map((row) => ({
      id: row._id,
      name: row.name,
      keyPrefix: row.keyPrefix,
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
      revokedAt: row.revokedAt,
      status: row.revokedAt ? "revoked" : "active",
    }));

  const visibleRenders = renders.map((row) => ({
    id: row._id,
    originalUrl: row.originalUrl,
    title: row.title,
    cacheHit: row.cacheHit,
    renderTimeMs: row.renderTimeMs,
    createdAt: row.createdAt,
  }));

  return new Response(
    JSON.stringify({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        fullName: user.fullName,
      },
      usage,
      keys: visibleKeys,
      renders: visibleRenders,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
