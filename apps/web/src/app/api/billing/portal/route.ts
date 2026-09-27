import { auth } from "@clerk/nextjs/server";
import { createCustomerPortalSession } from "@/lib/dodo";
import { postConvexInternal } from "@/lib/user-sync";

// The customer id comes from our records for the signed-in user, never from the request body.
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const lookup = await postConvexInternal("/v1/internal/billing-customer", { clerkId: userId });
    if (!lookup.ok) throw new Error(`Billing lookup failed (${lookup.status})`);
    const { customerId } = (await lookup.json()) as { customerId: string | null };
    if (!customerId) {
      return new Response("There's no billing to manage yet. It appears after your first payment.", { status: 404 });
    }
    const webBase = process.env.WEB_BASE_URL ?? "http://localhost:3000";
    return Response.json(await createCustomerPortalSession(customerId, `${webBase}/dashboard/sites`));
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unable to open billing", { status: 500 });
  }
}
