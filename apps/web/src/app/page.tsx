import Link from "next/link";
import { MagicOnboarding } from "@/components/onboarding/magic-onboarding";

export default function HomePage() {
  return (
    <div className="grid" style={{ gap: 20 }}>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>OGSnap v1 MVP</h1>
        <p>
          Convex backend + Playwright renderer + DodoPayments-ready billing flow scaffold.
        </p>
        <div className="grid two">
          <Link href="/dashboard" className="button" style={{ textAlign: "center" }}>
            Open Dashboard
          </Link>
          <a className="button" style={{ textAlign: "center" }} href="https://docs.convex.dev" target="_blank" rel="noreferrer">
            Convex Docs
          </a>
        </div>
      </section>

      <MagicOnboarding />

      <section className="card">
        <h3 style={{ marginTop: 0 }}>3-line SDK</h3>
        <pre className="code">{`import { generateOG } from "@ogsnap/next";

export const { GET } = generateOG({
  apiKey: process.env.OGSNAP_API_KEY!,
});`}</pre>
      </section>
    </div>
  );
}
