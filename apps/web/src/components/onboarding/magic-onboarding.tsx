"use client";

import { useState } from "react";

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
    <section className="card grid" style={{ gap: 12 }}>
      <h3 style={{ margin: 0 }}>Magic Onboarding Demo</h3>
      <p style={{ margin: 0, opacity: 0.85 }}>
        Paste a URL and run the first render through the v1 API flow.
      </p>
      <input className="input" value={url} onChange={(event) => setUrl(event.target.value)} />
      <button className="button" type="button" onClick={runDemo} disabled={loading}>
        {loading ? "Rendering..." : "Generate Demo Image"}
      </button>

      {error ? <p style={{ color: "#fda4af", margin: 0 }}>{error}</p> : null}

      {result ? (
        <div className="grid" style={{ gap: 8 }}>
          <p style={{ margin: 0 }}>
            cache: <strong>{result.cacheHit ? "HIT" : "MISS"}</strong> | render: <strong>{result.renderTimeMs}ms</strong>
          </p>
          <img
            src={result.imageUrl}
            alt="OG render preview"
            style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(148,163,184,0.3)" }}
          />
        </div>
      ) : null}
    </section>
  );
}
