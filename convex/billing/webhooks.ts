import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { verifyStandardWebhook } from "../lib/security";

interface DodoWebhookPayload {
  type?: string;
  data?: {
    payload_type?: string;
    subscription_id?: string;
    customer?: { customer_id?: string };
    metadata?: {
      userId?: string;
      plan?: string;
      siteId?: string;
    };
    status?: string;
    next_billing_date?: string;
  };
}

const SITE_STATUS_BY_EVENT: Record<string, "active" | "canceled"> = {
  "subscription.active": "active",
  "subscription.renewed": "active",
  "subscription.cancelled": "canceled",
  "subscription.expired": "canceled",
  "subscription.failed": "canceled",
};

export const dodoWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("DODO_WEBHOOK_SECRET missing", { status: 500 });
  }

  const rawBody = await request.text();
  const eventId = request.headers.get("webhook-id");
  const signatureValid = await verifyStandardWebhook(
    rawBody,
    {
      id: eventId,
      timestamp: request.headers.get("webhook-timestamp"),
      signature: request.headers.get("webhook-signature"),
    },
    secret,
  );

  if (!signatureValid || !eventId) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody) as DodoWebhookPayload;
  const eventType = payload.type ?? "unknown";

  const { webhookEventId, alreadyProcessed } = await ctx.runMutation(internal.billing.mutations.recordWebhookEvent, {
    provider: "dodo",
    eventId,
    eventType,
    payload: rawBody,
  });

  if (alreadyProcessed) {
    return Response.json({ received: true, duplicate: true });
  }

  const data = payload.data;
  if (data?.metadata?.userId && data.customer?.customer_id) {
    await ctx.runMutation(internal.billing.mutations.setCustomerId, {
      userId: data.metadata.userId,
      customerId: data.customer.customer_id,
    });
  }
  const siteStatus = SITE_STATUS_BY_EVENT[eventType];

  if (data?.metadata?.siteId) {
    if (siteStatus && data.metadata.userId) {
      await ctx.runMutation(internal.sites.mutations.setStatusFromBilling, {
        siteId: data.metadata.siteId,
        ownerId: data.metadata.userId,
        status: siteStatus,
      });
    }
  } else if (data?.metadata?.userId && data.subscription_id) {
    await ctx.runMutation(internal.billing.mutations.upsertSubscriptionByPaymentId, {
      userId: data.metadata.userId as Id<"users">,
      paymentSubscriptionId: data.subscription_id,
      paymentCustomerId: data.customer?.customer_id,
      plan: data.metadata.plan ?? "free",
      status: data.status ?? "active",
      currentPeriodEnd: data.next_billing_date ? Date.parse(data.next_billing_date) : undefined,
    });
  }

  await ctx.runMutation(internal.billing.mutations.markWebhookProcessed, { webhookEventId });

  return Response.json({ received: true });
});
