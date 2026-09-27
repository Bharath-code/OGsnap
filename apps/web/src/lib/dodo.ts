// DODO_ENVIRONMENT=live_mode for real charges; anything else hits test mode
const dodoApiBase = () =>
  process.env.DODO_ENVIRONMENT === "live_mode" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

interface CreateCheckoutInput {
  customerEmail: string;
  productId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

interface DodoRequestOptions {
  method: "POST" | "GET";
  path: string;
  body?: unknown;
}

async function dodoRequest<T>(options: DodoRequestOptions): Promise<T> {
  const apiKey = process.env.DODO_API_KEY;
  if (!apiKey) {
    throw new Error("DODO_API_KEY is not configured");
  }

  const response = await fetch(`${dodoApiBase()}${options.path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`DodoPayments error (${response.status}): ${await response.text()}`);
  }

  return (await response.json()) as T;
}

export async function createCheckoutSession(input: CreateCheckoutInput): Promise<{ checkoutUrl: string }> {
  const payload = await dodoRequest<{ checkout_url: string }>({
    method: "POST",
    path: "/checkouts",
    body: {
      product_cart: [{ product_id: input.productId, quantity: 1 }],
      customer: { email: input.customerEmail },
      return_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: input.metadata,
    },
  });

  return { checkoutUrl: payload.checkout_url };
}

export async function createCustomerPortalSession(customerId: string): Promise<{ portalUrl: string }> {
  const payload = await dodoRequest<{ url: string }>({
    method: "POST",
    path: "/customers/portal/sessions",
    body: {
      customer_id: customerId,
    },
  });

  return { portalUrl: payload.url };
}
