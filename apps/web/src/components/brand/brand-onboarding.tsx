"use client";

import { useState } from "react";
import { PaintBucket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface OnboardingBrand {
  title?: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
}

interface OnboardingPreview {
  title: string;
  description: string;
  imageUrl: string;
}

interface OnboardingResponse {
  success: boolean;
  brand?: OnboardingBrand;
  previews?: OnboardingPreview[];
  previewCount?: number;
  warnings?: string[];
  error?: string;
}

export function BrandOnboarding() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<OnboardingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    setStatus("Connecting...");
    setResult(null);

    try {
      const response = await fetch("/api/onboarding/magic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Onboarding failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      setResult({ success: true, previews: [], warnings: [] });

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.trim()) continue;

          let event = "message";
          let data = "";

          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              event = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              data = line.replace("data:", "").trim();
            }
          }

          if (!data) continue;
          const parsedData = JSON.parse(data);

          if (event === "status") {
            setStatus(parsedData.message);
          } else if (event === "brand") {
            setResult((prev) => ({
              ...prev!,
              brand: parsedData.brand,
            }));
          } else if (event === "preview") {
            setResult((prev) => {
              const currentPreviews = prev?.previews || [];
              return {
                ...prev!,
                previews: [...currentPreviews, parsedData],
              };
            });
          } else if (event === "warning") {
            setResult((prev) => {
              const currentWarnings = prev?.warnings || [];
              return {
                ...prev!,
                warnings: [...currentWarnings, parsedData.message],
              };
            });
          } else if (event === "error") {
            setError(parsedData.message);
          }
        }
      }

      setStatus(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Onboarding request failed");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <PaintBucket className="h-4 w-4 text-primary" />
          Magic Onboarding
        </CardTitle>
        <CardDescription>
          Paste your site URL. We extract branding with Firecrawl and generate 5 sample OG images.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="https://your-site.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRun()}
        />

        <Button type="button" disabled={loading || !url} onClick={handleRun}>
          {loading ? "Extracting brand & generating previews..." : "Extract Brand & Generate Previews"}
        </Button>

        {status ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span>{status}</span>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {result?.brand ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border/70 bg-muted/40 p-4 text-sm space-y-2">
              <p className="font-medium">Extracted Brand</p>
              <p><strong>Primary:</strong> <span style={{ color: result.brand.primaryColor }}>{result.brand.primaryColor}</span></p>
              <p><strong>Background:</strong> <span style={{ color: result.brand.backgroundColor }}>{result.brand.backgroundColor}</span></p>
              <p><strong>Font:</strong> {result.brand.fontFamily ?? "Inter"}</p>
              <p><strong>Site Title:</strong> {result.brand.title}</p>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
              {result.brand.logoUrl ? (
                <div>
                  <p className="text-sm font-medium mb-2">Detected Logo</p>
                  <img
                    src={result.brand.logoUrl}
                    alt="Extracted logo"
                    className="max-h-16 w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No logo detected</p>
              )}
            </div>
          </div>
        ) : null}

        {result?.previews && result.previews.length > 0 ? (
          <div className="space-y-3">
            <p className="font-medium">Generated Previews ({result.previews.length})</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.previews.map((preview, index) => (
                <div key={index} className="space-y-2">
                  <img
                    src={preview.imageUrl}
                    alt={`Preview: ${preview.title}`}
                    className="w-full rounded-lg border border-border/70"
                  />
                  <p className="text-xs text-muted-foreground truncate">{preview.title}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {result?.warnings && result.warnings.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            Some previews failed: {result.warnings.join(", ")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
