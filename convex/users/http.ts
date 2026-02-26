import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";

interface SyncUserBody {
  clerkId?: unknown;
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  fullName?: unknown;
  imageUrl?: unknown;
  organizationId?: unknown;
  organizationSlug?: unknown;
  organizationRole?: unknown;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export const syncUserFromIdentity = httpAction(async (ctx, request) => {
  const secret = process.env.INTERNAL_SERVICE_SECRET;
  if (!secret) {
    return new Response("INTERNAL_SERVICE_SECRET is not configured", { status: 500 });
  }

  if (request.headers.get("x-internal-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: SyncUserBody;
  try {
    body = (await request.json()) as SyncUserBody;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const clerkId = optionalString(body.clerkId);
  if (!clerkId) {
    return new Response("clerkId is required", { status: 400 });
  }

  const userId = await ctx.runMutation(api.users.mutations.upsertFromIdentity, {
    clerkId,
    email: optionalString(body.email),
    firstName: optionalString(body.firstName),
    lastName: optionalString(body.lastName),
    fullName: optionalString(body.fullName),
    imageUrl: optionalString(body.imageUrl),
    organizationId: optionalString(body.organizationId),
    organizationSlug: optionalString(body.organizationSlug),
    organizationRole: optionalString(body.organizationRole),
  });

  return new Response(JSON.stringify({ success: true, userId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
