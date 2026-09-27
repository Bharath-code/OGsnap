import { test } from "node:test";
import assert from "node:assert/strict";
import { R, aperturePaths } from "./aperture-geometry.ts";

test("every blade ends on the rim and the hole shrinks as it closes", () => {
  for (const open of [0, 0.5, 1]) {
    const ends = [...aperturePaths(open).blades.matchAll(/L(-?[\d.]+) (-?[\d.]+)/g)];
    assert.equal(ends.length, 6);
    for (const [, x, y] of ends) assert.ok(Math.abs(Math.hypot(+x, +y) - R) < 0.05);
  }
  const radius = (open) => Math.hypot(...aperturePaths(open).hole.split(" ")[0].split(",").map(Number));
  assert.ok(radius(0) < radius(1));
});
