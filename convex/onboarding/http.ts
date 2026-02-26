import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

interface OnboardingBody {
  userId?: unknown;
  url?: unknown;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export const magicOnboarding = httpAction(async (ctx, request) => {
  const secret = process.env.INTERNAL_SERVICE_SECRET;
  if (!secret) {
    return new Response("INTERNAL_SERVICE_SECRET is not configured", { status: 500 });
  }

  if (request.headers.get("x-internal-secret") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: OnboardingBody;
  try {
    body = (await request.json()) as OnboardingBody;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const url = optionalString(body.url);
  const userIdRaw = optionalString(body.userId);
  if (!url || !userIdRaw) {
    return new Response("url and userId are required", { status: 400 });
  }

  const userId = userIdRaw as Id<"users">;

  const subscription = await ctx.runMutation(api.render.mutations.seedDefaultSubscriptionIfMissing, {
    userId,
  });

  const extracted = await ctx.runAction(api.brand.actions.extractFromUrl, {
    url,
  });

  if (!extracted.success) {
    return new Response(
      JSON.stringify({
        success: false,
        error: extracted.error ?? "Failed to extract brand",
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const brand = extracted.result;

  const brandKitId = await ctx.runMutation(api.brand.mutations.upsertDefaultBrandKit, {
    userId,
    name: "Auto Imported",
    logoUrl: brand.logoUrl,
    primaryColor: brand.primaryColor ?? "#3B82F6",
    backgroundColor: brand.backgroundColor ?? "#0F172A",
    fontFamily: brand.fontFamily ?? "Inter, system-ui, sans-serif",
  });

  let previewImageUrl: string | undefined;
  let previewWarning: string | undefined;

  try {
    const preview = await ctx.runAction(api.render.actions.generateImage, {
      userId,
      plan: subscription?.plan ?? "free",
      url,
      title: brand.title ?? "Your Brand Preview",
      description: "Magic onboarding generated this preview.",
    });
    previewImageUrl = preview.imageUrl;
  } catch (error) {
    previewWarning = error instanceof Error ? error.message : "Preview generation failed";
  }

  return new Response(
    JSON.stringify({
      success: true,
      userId,
      brandKitId,
      brand,
      previewImageUrl,
      previewWarning,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
