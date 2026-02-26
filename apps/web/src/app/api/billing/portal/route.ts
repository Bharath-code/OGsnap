import { NextRequest } from "next/server";
import { createCustomerPortalSession } from "@/lib/dodo";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    customerId?: string;
  };

  if (!body.customerId) {
    return new Response("customerId is required", { status: 400 });
  }

  try {
    const portal = await createCustomerPortalSession(body.customerId);
    return Response.json(portal);
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Unable to create portal session", {
      status: 500,
    });
  }
}
