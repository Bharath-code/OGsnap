import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";

export const bootstrapDemo = httpAction(async (ctx, request) => {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not available in production", { status: 404 });
  }

  const secret = process.env.DEV_BOOTSTRAP_SECRET;

  if (!secret) {
    return new Response("DEV_BOOTSTRAP_SECRET is not configured", { status: 500 });
  }

  const provided = request.headers.get("x-bootstrap-secret");
  if (provided !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as {
    email?: string;
    clerkId?: string;
  };

  const clerkId = body.clerkId ?? `dev_${Date.now()}`;
  const userId = await ctx.runMutation(api.users.mutations.upsertFromIdentity, {
    clerkId,
    email: body.email,
    fullName: "Development User",
  });

  await ctx.runMutation(api.render.mutations.seedDefaultSubscriptionIfMissing, {
    userId,
  });

  const key = await ctx.runMutation(api.apiKeys.mutations.create, {
    userId,
    name: "demo-key",
  });

  return Response.json({
    userId,
    clerkId,
    apiKey: key.rawKey,
    keyPrefix: key.keyPrefix,
  });
});
