"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface KeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string;
  status: "active" | "revoked";
}

interface KeysTableProps {
  rows: KeyRow[];
}

export function KeysTable({ rows }: KeysTableProps): React.ReactElement {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const term = query.toLowerCase();
    return rows.filter((row) => row.name.toLowerCase().includes(term) || row.keyPrefix.toLowerCase().includes(term));
  }, [query, rows]);

  async function copyPrefix(row: KeyRow): Promise<void> {
    try {
      await navigator.clipboard.writeText(row.keyPrefix);
      setCopiedId(row.id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search key name or prefix"
          className="pl-9"
        />
      </label>

      <div className="rounded-lg border border-border/70 bg-card/65">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.keyPrefix}</TableCell>
                  <TableCell className="text-muted-foreground">{row.createdAt}</TableCell>
                  <TableCell className="text-muted-foreground">{row.lastUsedAt}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "active" ? "default" : "outline"}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => copyPrefix(row)}>
                      {copiedId === row.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      {copiedId === row.id ? "Copied" : "Copy"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No API keys found for this user yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
