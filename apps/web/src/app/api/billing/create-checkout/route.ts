import { NextRequest } from "next/server";
import { createCheckoutSession } from "@/lib/dodo";

const PLAN_TO_PRICE_ENV: Record<string, string> = {
  hobby: "DODO_HOBBY_PRICE_ID",
  pro: "DODO_PRO_PRICE_ID",
  scale: "DODO_SCALE_PRICE_ID",
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    plan?: "hobby" | "pro" | "scale";
    email?: string;
    userId?: string;
  };

  if (!body.plan || !body.email) {
    return new Response("plan and email are required", { status: 400 });
  }

  const envKey = PLAN_TO_PRICE_ENV[body.plan];
  const priceId = process.env[envKey];
  if (!priceId) {
    return new Response(`${envKey} is missing`, { status: 500 });
  }

  const webBase = process.env.WEB_BASE_URL ?? "http://localhost:3000";

  try {
    const checkout = await createCheckoutSession({
      customerEmail: body.email,
      priceId,
      successUrl: `${webBase}/dashboard/billing?checkout=success`,
      cancelUrl: `${webBase}/dashboard/billing?checkout=cancelled`,
      metadata: body.userId ? { userId: body.userId, plan: body.plan } : { plan: body.plan },
    });

    return Response.json(checkout);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unable to create checkout", { status: 500 });
  }
}
