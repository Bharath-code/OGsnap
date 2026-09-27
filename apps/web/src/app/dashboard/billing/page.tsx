import { BillingActions } from "@/components/dashboard/billing-actions";
import { Reveal } from "@/components/ui/reveal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardBillingPage() {
  return (
    <Reveal>
      <Card>
        <CardHeader>
          <CardTitle>API billing</CardTitle>
          <CardDescription>Plans for the render API. Sites are billed from the Sites page.</CardDescription>
        </CardHeader>
        <BillingActions />
      </Card>
    </Reveal>
  );
}
