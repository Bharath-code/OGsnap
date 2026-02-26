import Link from "next/link";

const sections = [
  { href: "/dashboard/keys", label: "API Keys" },
  { href: "/dashboard/brand", label: "Brand Kit" },
  { href: "/dashboard/renders", label: "Recent Renders" },
  { href: "/dashboard/billing", label: "Billing" },
];

export default function DashboardPage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        <p style={{ marginBottom: 0 }}>v1 shell: API keys, usage, brand kit, billing.</p>
      </section>

      <section className="grid two">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="card">
            <strong>{section.label}</strong>
          </Link>
        ))}
      </section>
    </div>
  );
}
