import Link from "next/link";

const tools = [
  { href: "/dashboard/keys", label: "API keys", blurb: "Create and revoke keys for the render API." },
  { href: "/dashboard/brand", label: "Brand kit", blurb: "Default logo and colors for API renders." },
  { href: "/dashboard/renders", label: "Renders", blurb: "Recent API renders, usage and cache hits." },
  { href: "/dashboard/playground", label: "Playground", blurb: "Try templates and platforms before calling the API." },
  { href: "/dashboard/billing", label: "API billing", blurb: "Hobby and Pro plans for the render API." },
];

export default function DeveloperPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="wdth-70 font-display text-4xl font-extrabold tracking-[-0.02em]">Developer</h1>
        <p className="max-w-[60ch] text-foreground/75">
          Tools for calling OGSnap from your own code. You don&apos;t need any of this to use Sites.
        </p>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-background">
              <span>
                <span className="block font-semibold">{tool.label}</span>
                <span className="text-sm text-muted-foreground">{tool.blurb}</span>
              </span>
              <span aria-hidden="true" className="font-mono text-muted-foreground">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
