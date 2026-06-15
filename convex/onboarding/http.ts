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

function sendSSE(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  const encoder = new TextEncoder();
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(encoder.encode(msg));
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

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const subscription = await ctx.runMutation(api.render.mutations.seedDefaultSubscriptionIfMissing, {
          userId,
        });

        sendSSE(controller, "status", { message: "Extracting brand guidelines..." });
        const extracted = await ctx.runAction(api.brand.actions.extractFromUrl, {
          url,
        });

        if (!extracted.success) {
          sendSSE(controller, "error", { message: extracted.error ?? "Failed to extract brand" });
          controller.close();
          return;
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

        sendSSE(controller, "brand", {
          brandKitId,
          brand,
        });

        sendSSE(controller, "status", { message: "Generating previews..." });

        const renderPromises = PREVIEW_TITLES.map(async (item, index) => {
          try {
            const preview = await ctx.runAction(api.render.actions.generateImage, {
              userId,
              plan: subscription?.plan ?? "free",
              url,
              title: item.title,
              description: item.description,
            });
            
            sendSSE(controller, "preview", {
              index,
              title: item.title,
              description: item.description,
              imageUrl: preview.imageUrl,
            });
          } catch (error) {
            sendSSE(controller, "warning", {
              index,
              message: error instanceof Error ? error.message : "Unknown error",
            });
          }
        });

        await Promise.allSettled(renderPromises);
        sendSSE(controller, "done", { success: true });
        controller.close();
      } catch (err) {
        sendSSE(controller, "error", { message: err instanceof Error ? err.message : "Internal error" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});
