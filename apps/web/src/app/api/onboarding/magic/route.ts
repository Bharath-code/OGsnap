import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { syncUserToConvex } from "@/lib/user-sync";

const bodySchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  const authState = await auth();
  const { userId } = authState;
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Valid url is required", { status: 400 });
  }

  let convexUserId: string;
  try {
    convexUserId = await syncUserToConvex(authState);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync user identity";
    return new Response(message, { status: 500 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const internalSecret = process.env.INTERNAL_SERVICE_SECRET;
  if (!convexUrl || !internalSecret) {
    return new Response("Convex internal configuration is missing", { status: 500 });
  }

  const response = await fetch(`${convexUrl}/v1/onboarding/magic`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": internalSecret,
    },
    body: JSON.stringify({
      userId: convexUserId,
      url: parsed.data.url,
    }),
  });

  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
