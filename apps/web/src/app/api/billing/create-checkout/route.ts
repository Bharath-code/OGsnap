import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCheckoutSession } from "@/lib/dodo";
import { syncUserToConvex } from "@/lib/user-sync";

const PLAN_TO_PRICE_ENV: Record<string, string> = {
  agency: "DODO_AGENCY_PRODUCT_ID",
};

export async function POST(request: NextRequest) {
  const authState = await auth();
  if (!authState.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as {
    plan?: "agency";
    siteId?: string;
    email?: string;
  };

  if (!body.plan && !body.siteId) {
    return new Response("plan or siteId is required", { status: 400 });
  }
  if (body.siteId !== undefined && !/^[a-z0-9]{10,64}$/.test(body.siteId)) {
    return new Response("Invalid siteId", { status: 400 });
  }

  const envKey = body.siteId ? "DODO_SITE_PRODUCT_ID" : PLAN_TO_PRICE_ENV[body.plan!];
  const productId = envKey ? process.env[envKey] : undefined;
  if (!envKey || !productId) {
    return new Response(`${envKey ?? "Product id"} is missing`, { status: 500 });
  }

  const webBase = process.env.WEB_BASE_URL ?? "http://localhost:3000";
  const returnPage = body.siteId || body.plan === "agency" ? "sites" : "billing";

  try {
    const convexUserId = await syncUserToConvex(authState);
    const clerkUser = await currentUser();
    const fallbackEmail =
      clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses?.[0]?.emailAddress;
    const customerEmail = body.email?.trim() || fallbackEmail;

    if (!customerEmail) {
      return new Response("A valid checkout email is required", { status: 400 });
    }

    const checkout = await createCheckoutSession({
      customerEmail,
      productId,
      successUrl: `${webBase}/dashboard/${returnPage}?checkout=success`,
      cancelUrl: `${webBase}/dashboard/${returnPage}?checkout=cancelled`,
      // ownership is enforced when the webhook applies the status (setStatusFromBilling)
      metadata: body.siteId ? { userId: convexUserId, siteId: body.siteId } : { userId: convexUserId, plan: body.plan! },
    });

    return Response.json(checkout);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unable to create checkout", { status: 500 });
  }
}
