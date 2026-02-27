"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DemoResponse {
  imageUrl: string;
  cacheHit: boolean;
  renderTimeMs: number;
}

export function MagicOnboarding() {
  const [url, setUrl] = useState("https://example.com/blog/my-post");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DemoResponse | null>(null);

  async function runDemo() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/demo-render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as DemoResponse;
      setResult(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to render");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <Badge className="w-fit">Try It Live</Badge>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-4 w-4 text-primary" />
          Magic Onboarding Demo
        </CardTitle>
        <CardDescription>Paste a URL and run the first render through the v1 API flow.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input value={url} onChange={(event) => setUrl(event.target.value)} />
        <Button type="button" onClick={runDemo} disabled={loading}>
          {loading ? "Rendering..." : "Generate Demo Image"}
        </Button>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {result ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              cache: <strong className="text-foreground">{result.cacheHit ? "HIT" : "MISS"}</strong> | render:{" "}
              <strong className="text-foreground">{result.renderTimeMs}ms</strong>
            </div>
            <img
              src={result.imageUrl}
              alt="OG render preview"
              className="w-full rounded-lg border border-border/70 object-cover"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
