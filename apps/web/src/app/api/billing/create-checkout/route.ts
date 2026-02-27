import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createCheckoutSession } from "@/lib/dodo";
import { syncUserToConvex } from "@/lib/user-sync";

const PLAN_TO_PRICE_ENV: Record<string, string> = {
  hobby: "DODO_HOBBY_PRICE_ID",
  pro: "DODO_PRO_PRICE_ID",
  scale: "DODO_SCALE_PRICE_ID",
};

export async function POST(request: NextRequest) {
  const authState = await auth();
  if (!authState.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json()) as {
    plan?: "hobby" | "pro" | "scale";
    email?: string;
  };

  if (!body.plan) {
    return new Response("plan is required", { status: 400 });
  }

  const envKey = PLAN_TO_PRICE_ENV[body.plan];
  const priceId = process.env[envKey];
  if (!priceId) {
    return new Response(`${envKey} is missing`, { status: 500 });
  }

  const webBase = process.env.WEB_BASE_URL ?? "http://localhost:3000";

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
      priceId,
      successUrl: `${webBase}/dashboard/billing?checkout=success`,
      cancelUrl: `${webBase}/dashboard/billing?checkout=cancelled`,
      metadata: { userId: convexUserId, plan: body.plan },
    });

    return Response.json(checkout);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unable to create checkout", { status: 500 });
  }
}
