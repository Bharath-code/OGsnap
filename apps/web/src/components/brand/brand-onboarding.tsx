"use client";

import { useState } from "react";
import { PaintBucket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface OnboardingBrand {
  title?: string;
  logoUrl?: string;
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
}

interface OnboardingResponse {
  success: boolean;
  brand?: OnboardingBrand;
  previewImageUrl?: string;
  previewWarning?: string;
  error?: string;
}

export function BrandOnboarding() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OnboardingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding/magic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const payload = (await response.json()) as OnboardingResponse;

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "Onboarding failed");
        setResult(null);
        return;
      }

      setResult(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Onboarding request failed");
      setResult(null);
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
          Paste your site URL. We extract branding with Firecrawl and persist your default brand kit.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Input
          placeholder="https://your-site.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />

        <Button type="button" disabled={loading || !url} onClick={handleRun}>
          {loading ? "Extracting..." : "Extract And Save Brand"}
        </Button>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        {result?.brand ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border/70 bg-muted/40 p-4 text-sm">
              <p>
                <strong>Primary:</strong> {result.brand.primaryColor ?? "n/a"}
              </p>
              <p>
                <strong>Background:</strong> {result.brand.backgroundColor ?? "n/a"}
              </p>
              <p>
                <strong>Font:</strong> {result.brand.fontFamily ?? "n/a"}
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/40 p-4">
              {result.brand.logoUrl ? (
                <img
                  src={result.brand.logoUrl}
                  alt="Extracted logo"
                  className="max-h-20 w-full object-contain"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No logo detected</p>
              )}
            </div>
          </div>
        ) : null}

        {result?.previewImageUrl ? (
          <img
            src={result.previewImageUrl}
            alt="Generated OG preview"
            className="w-full rounded-lg border border-border/70"
          />
        ) : null}

        {result?.previewWarning ? <p className="text-sm text-muted-foreground">{result.previewWarning}</p> : null}
      </CardContent>
    </Card>
  );
}
