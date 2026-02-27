import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface RenderRow {
  id: string;
  originalUrl: string;
  title?: string;
  cacheHit: boolean;
  renderTimeMs: number;
  createdAt: string;
}

interface RendersTableProps {
  rows: RenderRow[];
}

export function RendersTable({ rows }: RendersTableProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-border/70 bg-card/65">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Render ID</TableHead>
            <TableHead>Source URL</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Cache</TableHead>
            <TableHead>Render Time</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id} className="group cursor-pointer">
                <TableCell className="font-mono text-xs text-muted-foreground group-hover:text-foreground">{row.id}</TableCell>
                <TableCell className="text-muted-foreground">{row.originalUrl}</TableCell>
                <TableCell className="font-medium">{row.title ?? "Untitled"}</TableCell>
                <TableCell>
                  <Badge variant={row.cacheHit ? "default" : "secondary"}>{row.cacheHit ? "HIT" : "MISS"}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.renderTimeMs} ms</TableCell>
                <TableCell className="text-muted-foreground">{row.createdAt}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                No renders found yet. Trigger `POST /v1/render` to populate this table.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
