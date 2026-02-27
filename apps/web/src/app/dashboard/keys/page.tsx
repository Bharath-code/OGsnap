"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Check, Copy, KeyRound, RotateCcw, ShieldCheck } from "lucide-react";
import { KeysTable, type KeyRow } from "@/components/dashboard/keys-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Reveal } from "@/components/ui/reveal";
import { useCreateApiKey, useKeysDashboardData } from "@/lib/dashboard-live";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(timestamp?: number): string {
  if (!timestamp) return "Never";
  return dateFormatter.format(new Date(timestamp));
}

function formatAgeFromNow(timestamp?: number): string {
  if (!timestamp) return "Never";
  const diffMs = Date.now() - timestamp;
  if (diffMs <= 0) return "Now";

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays < 30) return `${diffDays}d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}y ago`;
}

export default function DashboardKeysPage(): React.ReactElement {
  const { userId } = useAuth();
  const payload = useKeysDashboardData(userId);
  const createApiKey = useCreateApiKey();
  const [keyName, setKeyName] = useState("default");
  const [creating, setCreating] = useState(false);
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const rows = useMemo<KeyRow[]>(
    () =>
      payload?.keys.map((key) => ({
        id: key.id,
        name: key.name,
        keyPrefix: key.keyPrefix,
        createdAt: formatDate(key.createdAt),
        lastUsedAt: formatDate(key.lastUsedAt),
        status: key.status,
      })) ?? [],
    [payload],
  );

  const activeKeys = payload?.keys.filter((key) => key.status === "active").length ?? 0;
  const revokedKeys = payload?.keys.filter((key) => key.status === "revoked").length ?? 0;
  const newestKeyTs = payload?.keys.reduce<number | undefined>(
    (latest, key) => (latest === undefined || key.createdAt > latest ? key.createdAt : latest),
    undefined,
  );

  const metrics = [
    { label: "Active Keys", value: String(activeKeys), icon: ShieldCheck },
    { label: "Revoked", value: String(revokedKeys), icon: RotateCcw },
    { label: "Last Rotation", value: formatAgeFromNow(newestKeyTs), icon: KeyRound },
  ];

  const planSummary =
    payload === undefined
      ? "Connecting to live key telemetry..."
      : payload
        ? `Plan ${payload.usage.plan} • ${payload.usage.rendersUsed}/${payload.usage.renderLimit} renders this month`
        : "No Convex user record found yet";

  async function handleCreateKey(): Promise<void> {
    if (!payload?.user.id) {
      setCreateError("User record not ready yet. Refresh in a moment.");
      return;
    }

    const name = keyName.trim();
    if (!name) {
      setCreateError("Key name is required.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCopied(false);

    try {
      const created = await createApiKey({
        userId: payload.user.id,
        name,
      });
      setNewRawKey(created.rawKey);
      setKeyName("");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function copyNewRawKey(): Promise<void> {
    if (!newRawKey) return;
    await navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <Card>
          <CardHeader>
            <Badge className="w-fit">Key Management</Badge>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              API Keys
            </CardTitle>
            <CardDescription>
              Provision, rotate, revoke, and monitor key usage with audit-friendly metadata. {planSummary}
            </CardDescription>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
                placeholder="Key name (e.g. production)"
                className="sm:max-w-sm"
              />
              <Button
                type="button"
                onClick={handleCreateKey}
                disabled={creating || payload === undefined || payload === null}
              >
                {creating ? "Creating..." : "Create API Key"}
              </Button>
            </div>
            {newRawKey ? (
              <div className="rounded-md border border-border/70 bg-muted/40 p-2 text-sm">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Copy this key now</p>
                <div className="flex items-center gap-2">
                  <code className="truncate font-mono text-xs text-foreground">{newRawKey}</code>
                  <Button type="button" variant="ghost" size="sm" onClick={copyNewRawKey}>
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            ) : null}
            {createError ? <p className="text-sm text-red-500">{createError}</p> : null}
          </CardHeader>
        </Card>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((item, index) => (
          <Reveal key={item.label} delay={80 + index * 60}>
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

      <Reveal delay={170}>
        <KeysTable rows={rows} />
      </Reveal>
    </div>
  );
}
