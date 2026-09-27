import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (value: unknown, max: number) =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max ? value.trim() : undefined;

export const createLead = httpAction(async (ctx, request) => {
  const secret = process.env.INTERNAL_SERVICE_SECRET;
  if (!secret) {
    return new Response("INTERNAL_SERVICE_SECRET is not configured", { status: 500 });
  }

  if (request.headers.get("x-internal-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const email = str(body.email, 254)?.toLowerCase();
  const url = str(body.url, 2048);
  const source = str(body.source, 64) ?? "landing";
  if (!email || !EMAIL.test(email) || !url) {
    return new Response("Valid email and url are required", { status: 400 });
  }

  const leadId = await ctx.runMutation(internal.leads.mutations.create, {
    email,
    url,
    platform: str(body.platform, 32),
    source,
  });

  return new Response(JSON.stringify({ success: true, leadId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
