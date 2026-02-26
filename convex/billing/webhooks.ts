import { httpAction } from "../_generated/server";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { verifyDodoSignature } from "../lib/security";

interface DodoWebhookPayload {
  id?: string;
  type?: string;
  data?: {
    subscription_id?: string;
    customer_id?: string;
    metadata?: {
      userId?: string;
      plan?: string;
    };
    status?: string;
    current_period_end?: number;
  };
}

export const dodoWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("DODO_WEBHOOK_SECRET missing", { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-dodo-signature");
  const signatureValid = await verifyDodoSignature(rawBody, signature, secret);

  if (!signatureValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody) as DodoWebhookPayload;
  const eventId = payload.id ?? `evt_${Date.now()}`;
  const eventType = payload.type ?? "unknown";

  const eventLogId = await ctx.runMutation(api.billing.mutations.recordWebhookEvent, {
    provider: "dodo",
    eventId,
    eventType,
    payload: rawBody,
  });

  const userId = payload.data?.metadata?.userId;
  const paymentSubscriptionId = payload.data?.subscription_id;

  if (userId && paymentSubscriptionId) {
    await ctx.runMutation(api.billing.mutations.upsertSubscriptionByPaymentId, {
      userId: userId as Id<"users">,
      paymentSubscriptionId,
      paymentCustomerId: payload.data?.customer_id,
      plan: payload.data?.metadata?.plan ?? "free",
      status: payload.data?.status ?? "active",
      currentPeriodEnd: payload.data?.current_period_end,
    });
  }

  await ctx.runMutation(api.billing.mutations.markWebhookProcessed, {
    webhookEventId: eventLogId,
  });

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});
