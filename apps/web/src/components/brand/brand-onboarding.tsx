"use client";

import { useState } from "react";

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
    <section className="card grid" style={{ gap: 12 }}>
      <h3 style={{ margin: 0 }}>Magic Onboarding</h3>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Paste your site URL. We extract branding with Firecrawl and persist your default brand kit.
      </p>

      <input
        className="input"
        placeholder="https://your-site.com"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />

      <button className="button" type="button" disabled={loading || !url} onClick={handleRun}>
        {loading ? "Extracting..." : "Extract And Save Brand"}
      </button>

      {error ? <p style={{ margin: 0, color: "#fca5a5" }}>{error}</p> : null}

      {result?.brand ? (
        <div className="grid two">
          <div className="card" style={{ padding: 14 }}>
            <p style={{ margin: 0 }}>
              <strong>Primary</strong>: {result.brand.primaryColor ?? "n/a"}
            </p>
            <p style={{ margin: "8px 0 0 0" }}>
              <strong>Background</strong>: {result.brand.backgroundColor ?? "n/a"}
            </p>
            <p style={{ margin: "8px 0 0 0" }}>
              <strong>Font</strong>: {result.brand.fontFamily ?? "n/a"}
            </p>
          </div>

          <div className="card" style={{ padding: 14 }}>
            {result.brand.logoUrl ? (
              <img
                src={result.brand.logoUrl}
                alt="Extracted logo"
                style={{ maxWidth: "100%", maxHeight: 80, objectFit: "contain" }}
              />
            ) : (
              <p style={{ margin: 0 }}>No logo detected</p>
            )}
          </div>
        </div>
      ) : null}

      {result?.previewImageUrl ? (
        <img
          src={result.previewImageUrl}
          alt="Generated OG preview"
          style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(148, 163, 184, 0.3)" }}
        />
      ) : null}

      {result?.previewWarning ? <p style={{ margin: 0, opacity: 0.8 }}>{result.previewWarning}</p> : null}
    </section>
  );
}
