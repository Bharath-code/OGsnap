import { Palette } from "lucide-react";
import { BrandOnboarding } from "@/components/brand/brand-onboarding";
import { Reveal } from "@/components/ui/reveal";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardBrandPage() {
  return (
    <div className="space-y-4">
      <Reveal>
        <BrandOnboarding />
      </Reveal>
      <Reveal delay={120}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-4 w-4 text-primary" />
              Brand Kit Data Model
            </CardTitle>
            <CardDescription>
              Stored in Convex `brandKits` with a single default profile per user for v1.
            </CardDescription>
          </CardHeader>
        </Card>
      </Reveal>
    </div>
  );
}
