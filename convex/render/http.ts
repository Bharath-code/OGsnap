import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";
import { hashApiKey } from "../lib/security";
import { buildRenderCacheKey } from "../lib/cache";

interface RenderBody {
  url?: string;
  title?: string;
  description?: string;
  template?: string;
  width?: number;
  height?: number;
}

export const renderImage = httpAction(async (ctx, request) => {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const rawKey = authorization.replace("Bearer ", "").trim();
  const keyHash = await hashApiKey(rawKey);

  const apiKey = await ctx.runQuery(api.apiKeys.queries.getByHash, { keyHash });
  if (!apiKey) {
    return json({ error: "Invalid API key" }, 401);
  }

  const body = (await request.json()) as RenderBody;
  if (!body.url) {
    return json({ error: "url is required" }, 400);
  }

  const seededSubscription = await ctx.runMutation(api.render.mutations.seedDefaultSubscriptionIfMissing, {
    userId: apiKey.userId,
  });

  const usage = await ctx.runQuery(api.usage.queries.getUsageForCurrentMonth, {
    userId: apiKey.userId,
  });

  if (usage.remaining <= 0) {
    return json(
      {
        error: "Monthly render limit reached",
        limit: usage.renderLimit,
        used: usage.rendersUsed,
      },
      402,
    );
  }

  const cacheKey = buildRenderCacheKey({
    apiKeyId: String(apiKey._id),
    url: body.url,
    title: body.title,
    description: body.description,
    template: body.template,
    width: body.width,
    height: body.height,
  });

  const cached = await ctx.runQuery(api.render.queries.getCachedRender, { cacheKey });
  if (cached?.imageUrl) {
    await ctx.runMutation(api.usage.mutations.incrementMonthlyUsage, {
      userId: apiKey.userId,
      by: 1,
    });

    await ctx.runMutation(api.apiKeys.mutations.touchLastUsed, {
      apiKeyId: apiKey._id,
    });

    return json(
      {
        imageUrl: cached.imageUrl,
        cacheHit: true,
        renderTimeMs: cached.renderTimeMs,
      },
      200,
      {
        "X-Cache": "HIT",
      },
    );
  }

  const renderResult = await ctx.runAction(api.render.actions.generateImage, {
    userId: apiKey.userId,
    plan: seededSubscription?.plan ?? "free",
    url: body.url,
    title: body.title,
    description: body.description,
    width: body.width,
    height: body.height,
  });

  await ctx.runMutation(api.apiKeys.mutations.touchLastUsed, {
    apiKeyId: apiKey._id,
  });

  await ctx.runMutation(api.render.mutations.recordRender, {
    userId: apiKey.userId,
    apiKeyId: apiKey._id,
    cacheKey,
    originalUrl: body.url,
    title: body.title,
    description: body.description,
    imageUrl: renderResult.imageUrl,
    cacheHit: false,
    renderTimeMs: renderResult.renderTimeMs,
  });

  return json(
    {
      imageUrl: renderResult.imageUrl,
      cacheHit: false,
      renderTimeMs: renderResult.renderTimeMs,
    },
    200,
    {
      "X-Cache": "MISS",
    },
  );
});

export const renderCorsPreflight = httpAction(async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
});

function corsHeaders(extra: Record<string, string> = {}): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    ...extra,
  };
}

function json(payload: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(extraHeaders),
    },
  });
}
