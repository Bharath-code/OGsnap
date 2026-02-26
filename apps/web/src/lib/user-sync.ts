import { currentUser } from "@clerk/nextjs/server";

interface AuthIdentityInput {
  userId: string | null | undefined;
  orgId: string | null | undefined;
  orgRole: string | null | undefined;
  orgSlug: string | null | undefined;
}

interface SyncIdentityPayload {
  clerkId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  organizationId?: string;
  organizationSlug?: string;
  organizationRole?: string;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

async function buildIdentityPayload(authState: AuthIdentityInput): Promise<SyncIdentityPayload> {
  if (!authState.userId) {
    throw new Error("Cannot sync user identity without an authenticated Clerk user");
  }

  const user = await currentUser();
  const firstName = optionalString(user?.firstName);
  const lastName = optionalString(user?.lastName);

  return {
    clerkId: authState.userId,
    email: optionalString(
      user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress,
    ),
    firstName,
    lastName,
    fullName: optionalString(user?.fullName ?? [firstName, lastName].filter(Boolean).join(" ")),
    imageUrl: optionalString(user?.imageUrl),
    organizationId: optionalString(authState.orgId),
    organizationSlug: optionalString(authState.orgSlug),
    organizationRole: optionalString(authState.orgRole),
  };
}

export async function syncUserToConvex(authState: AuthIdentityInput): Promise<string> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  }

  const internalSecret = process.env.INTERNAL_SERVICE_SECRET;
  if (!internalSecret) {
    throw new Error("INTERNAL_SERVICE_SECRET is not configured");
  }

  const identity = await buildIdentityPayload(authState);
  const response = await fetch(`${convexUrl}/v1/internal/sync-user`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": internalSecret,
    },
    body: JSON.stringify(identity),
  });

  if (!response.ok) {
    throw new Error(`Convex sync-user failed (${response.status}): ${await response.text()}`);
  }

  const payload = (await response.json()) as { userId?: string };
  if (!payload.userId) {
    throw new Error("Convex sync-user response missing userId");
  }

  return payload.userId;
}
