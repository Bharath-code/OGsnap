import { BrandOnboarding } from "@/components/brand/brand-onboarding";

export default function DashboardBrandPage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <BrandOnboarding />
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Brand Kit Data Model</h2>
        <p style={{ marginBottom: 0 }}>
          Stored in Convex `brandKits` with a single default profile per user for v1.
        </p>
      </section>
    </div>
  );
}
