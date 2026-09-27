import { test } from "node:test";
import assert from "node:assert/strict";
import { readCheck } from "./read-check.ts";

const site = { id: "abc", domain: "tidepool.app", status: "trial", coveredByPlan: false, createdAt: 0 };
const last = (r) => r.lines.at(-1).text;

test("live only when og:image is this site's image", () => {
  assert.equal(readCheck({ verdict: "ok", image: "https://x.convex.site/v1/site/abc/og.png" }, site).tone, "ok");
  const other = readCheck({ verdict: "ok", image: "https://tidepool.app/cover.png" }, site);
  assert.equal(other.tone, "warn");
  assert.match(last(other), /its own og:image/);
});

test("every failing verdict tells the owner what to do", () => {
  for (const verdict of ["missing", "generic", "broken", "unknown"]) {
    const r = readCheck({ verdict, imageStatus: "404" }, site);
    assert.equal(r.tone, "bad");
    assert.ok(last(r).length > 20);
  }
});
