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

const PREVIEW_TITLES = [
  { title: "Welcome to Our Site", description: "Discover what we have to offer" },
  { title: "New Features Released", description: "Check out the latest updates" },
  { title: "How It Works", description: "Learn about our process" },
  { title: "Get Started Today", description: "Join thousands of users" },
  { title: "Our Mission", description: "Building the future together" },
];

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

  const previews: Array<{ title: string; description: string; imageUrl: string }> = [];
  const warnings: string[] = [];

  for (let i = 0; i < PREVIEW_TITLES.length; i++) {
    try {
      const preview = await ctx.runAction(api.render.actions.generateImage, {
        userId,
        plan: subscription?.plan ?? "free",
        url,
        title: PREVIEW_TITLES[i].title,
        description: PREVIEW_TITLES[i].description,
      });
      previews.push({
        title: PREVIEW_TITLES[i].title,
        description: PREVIEW_TITLES[i].description,
        imageUrl: preview.imageUrl,
      });
    } catch (error) {
      warnings.push(`Preview ${i + 1} failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      userId,
      brandKitId,
      brand,
      previews,
      previewCount: previews.length,
      warnings: warnings.length > 0 ? warnings : undefined,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
