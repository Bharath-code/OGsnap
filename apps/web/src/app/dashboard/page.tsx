import Link from "next/link";
import { AreaChart, KeyRound, Palette, ReceiptText } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  { href: "/dashboard/keys", label: "API Keys", icon: KeyRound, blurb: "Issue and manage live keys" },
  { href: "/dashboard/brand", label: "Brand Kit", icon: Palette, blurb: "Set default visual language" },
  { href: "/dashboard/renders", label: "Recent Renders", icon: AreaChart, blurb: "Monitor usage and cache" },
  { href: "/dashboard/billing", label: "Billing", icon: ReceiptText, blurb: "Checkout and portal actions" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Operational control surface for v1 render infrastructure.</CardDescription>
          </CardHeader>
        </Card>
      </Reveal>

      <section className="grid gap-4 md:grid-cols-2">
        {sections.map((section, index) => (
          <Reveal key={section.href} delay={70 + index * 55}>
            <Link href={section.href}>
              <Card className="h-full transition-transform duration-200 hover:-translate-y-1 hover:border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <section.icon className="h-4 w-4 text-primary" />
                    {section.label}
                  </CardTitle>
                  <CardDescription>{section.blurb}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-xs uppercase tracking-wider text-muted-foreground">Open module</CardContent>
              </Card>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
