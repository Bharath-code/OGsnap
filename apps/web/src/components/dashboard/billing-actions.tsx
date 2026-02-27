"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
    <CardContent className="space-y-4">
      <label className="grid gap-2 text-sm">
        <span className="font-medium text-foreground">Email for checkout</span>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" onClick={() => startCheckout("hobby")}>
          Start Hobby ($9)
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button type="button" onClick={() => startCheckout("pro")} variant="secondary">
          Start Pro ($29)
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-foreground">Customer ID for portal</span>
        <Input value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
      </label>

      <Button type="button" onClick={openPortal} variant="outline">
        Open Customer Portal
        <ExternalLink className="h-4 w-4" />
      </Button>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </CardContent>
  );
}
