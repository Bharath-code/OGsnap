import { BillingActions } from "@/components/dashboard/billing-actions";

export default function DashboardBillingPage() {
  return (
    <section className="card grid" style={{ gap: 12 }}>
      <h2 style={{ marginTop: 0, marginBottom: 0 }}>Billing</h2>
      <p style={{ margin: 0 }}>DodoPayments checkout + customer portal integration scaffold.</p>
      <BillingActions />
    </section>
  );
}
