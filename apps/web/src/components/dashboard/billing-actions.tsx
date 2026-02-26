"use client";

import { useState } from "react";

export function BillingActions() {
  const [email, setEmail] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function startCheckout(plan: "hobby" | "pro" | "scale") {
    setMessage("Opening checkout...");

    const response = await fetch("/api/billing/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan, email }),
    });

    if (!response.ok) {
      setMessage(await response.text());
      return;
    }

    const payload = (await response.json()) as { checkoutUrl: string };
    window.location.href = payload.checkoutUrl;
  }

  async function openPortal() {
    setMessage("Opening customer portal...");

    const response = await fetch("/api/billing/portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      setMessage(await response.text());
      return;
    }

    const payload = (await response.json()) as { portalUrl: string };
    window.location.href = payload.portalUrl;
  }

  return (
    <div className="grid" style={{ gap: 10 }}>
      <label className="grid" style={{ gap: 6 }}>
        <span>Email for checkout</span>
        <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>

      <div className="grid two">
        <button className="button" type="button" onClick={() => startCheckout("hobby")}>Start Hobby ($9)</button>
        <button className="button" type="button" onClick={() => startCheckout("pro")}>Start Pro ($29)</button>
      </div>

      <label className="grid" style={{ gap: 6 }}>
        <span>Customer ID for portal</span>
        <input className="input" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
      </label>

      <button className="button" type="button" onClick={openPortal}>Open Customer Portal</button>

      {message ? <p style={{ margin: 0, opacity: 0.85 }}>{message}</p> : null}
    </div>
  );
}
