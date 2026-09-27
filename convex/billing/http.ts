import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";

// Server-to-server only: the web app passes the Clerk id from its own session, never from the browser.
export const billingCustomer = httpAction(async (ctx, request) => {
  const secret = process.env.INTERNAL_SERVICE_SECRET;
  if (!secret) return new Response("INTERNAL_SERVICE_SECRET is not configured", { status: 500 });
  if (request.headers.get("x-internal-secret") !== secret) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json().catch(() => null)) as { clerkId?: unknown } | null;
  if (typeof body?.clerkId !== "string" || !body.clerkId) return new Response("clerkId is required", { status: 400 });

  const customerId = await ctx.runQuery(internal.billing.queries.customerIdForClerk, { clerkId: body.clerkId });
  return Response.json({ customerId });
});
