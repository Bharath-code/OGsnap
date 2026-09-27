import assert from "node:assert/strict";
import { AGENCY_SITES, agencySiteUpdates } from "../packages/core/src/agency.ts";

type Status = "trial" | "active" | "canceled";
const site = (id: number, status: Status, coveredByPlan?: boolean) => ({ _id: id, status, coveredByPlan });

const trials = Array.from({ length: 12 }, (_, i) => site(i, "trial"));
const started = agencySiteUpdates([...trials, site(99, "active")], true);
assert.equal(started.length, AGENCY_SITES, "covers at most AGENCY_SITES trial sites");
assert.ok(started.every((u) => u.status === "active" && u.coveredByPlan && u.id !== 99), "leaves per-site paid sites alone");

const full = Array.from({ length: AGENCY_SITES }, (_, i) => site(i, "active", true));
assert.equal(agencySiteUpdates([...full, site(50, "trial")], true).length, 0, "no slots left when all covered");

const lapsed = agencySiteUpdates([site(1, "active", true), site(2, "active"), site(3, "canceled")], false);
assert.deepEqual(lapsed, [{ id: 1, status: "trial", coveredByPlan: false }], "lapse reverts only covered sites");

console.log("agency site checks passed");
