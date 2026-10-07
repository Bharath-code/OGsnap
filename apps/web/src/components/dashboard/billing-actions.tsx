"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PLAN_PRICES } from "@/lib/pricing";

export function BillingActions() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function startCheckout(plan: "agency") {
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
        <Button type="button" onClick={() => startCheckout("agency")}>
          Start Agency (${PLAN_PRICES.agency})
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Button type="button" onClick={openPortal} variant="outline">
        Open Customer Portal
        <ExternalLink className="h-4 w-4" />
      </Button>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </CardContent>
  );
}
