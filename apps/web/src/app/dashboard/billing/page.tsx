import { BillingActions } from "@/components/dashboard/billing-actions";
import { Reveal } from "@/components/ui/reveal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardBillingPage() {
  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>DodoPayments checkout + customer portal integration scaffold.</CardDescription>
        </CardHeader>
        <BillingActions />
      </Card>
    </Reveal>
  );
}
