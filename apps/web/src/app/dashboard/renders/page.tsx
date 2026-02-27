"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { Activity, Gauge, Layers3, Timer } from "lucide-react";
import { RendersTable, type RenderRow } from "@/components/dashboard/renders-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { useRendersDashboardData } from "@/lib/dashboard-live";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(timestamp: number): string {
  return dateFormatter.format(new Date(timestamp));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

export default function DashboardRendersPage(): React.ReactElement {
  const { userId } = useAuth();
  const payload = useRendersDashboardData(userId);

  const rows = useMemo<RenderRow[]>(
    () =>
      payload?.renders.map((render) => ({
        id: render.id,
        originalUrl: render.originalUrl,
        title: render.title,
        cacheHit: render.cacheHit,
        renderTimeMs: render.renderTimeMs,
        createdAt: formatDate(render.createdAt),
      })) ?? [],
    [payload],
  );

  const now = Date.now();
  const recentThreshold = now - 24 * 60 * 60 * 1000;
  const durations = useMemo(
    () => (payload?.renders.map((render) => render.renderTimeMs).sort((a, b) => a - b) ?? []),
    [payload],
  );
  const cacheHits = payload?.renders.filter((render) => render.cacheHit).length ?? 0;
  const renders24h = payload?.renders.filter((render) => render.createdAt >= recentThreshold).length ?? 0;
  const cacheHitRate = payload?.renders.length ? Math.round((cacheHits / payload.renders.length) * 100) : 0;
  const medianRenderMs = percentile(durations, 50);
  const p95RenderMs = percentile(durations, 95);

  const metrics = [
    { label: "24h Renders", value: String(renders24h), icon: Activity },
    { label: "Cache Hit Rate", value: `${cacheHitRate}%`, icon: Layers3 },
    { label: "Median Time", value: `${medianRenderMs} ms`, icon: Timer },
    { label: "P95 Time", value: `${p95RenderMs} ms`, icon: Gauge },
  ];

  const usageSummary =
    payload === undefined
      ? "Connecting to live render telemetry..."
      : payload
        ? `${payload.usage.rendersUsed}/${payload.usage.renderLimit} renders used in ${payload.usage.month}`
        : "No Convex user record found yet";

  return (
    <div className="space-y-4">
      <Reveal>
        <Card>
          <CardHeader>
            <Badge className="w-fit">Render Ops</Badge>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Renders
            </CardTitle>
            <CardDescription>
              Operational view of render throughput, cache behavior, and response timings. {usageSummary}
            </CardDescription>
          </CardHeader>
        </Card>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((item, index) => (
          <Reveal key={item.label} delay={80 + index * 55}>
            <Card className="h-full">
              <CardHeader className="space-y-1.5">
                <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wide">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                  {item.label}
                </CardDescription>
                <CardTitle className="text-2xl">{item.value}</CardTitle>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delay={180}>
        <RendersTable rows={rows} />
      </Reveal>
    </div>
  );
}
