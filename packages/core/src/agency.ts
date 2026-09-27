export const AGENCY_SITES = 10;

interface PlanSite<Id> {
  _id: Id;
  status: "trial" | "active" | "canceled";
  coveredByPlan?: boolean;
}

// Which sites to flip when an agency plan starts or lapses. Sites paid one by one are never touched.
export function agencySiteUpdates<Id>(sites: PlanSite<Id>[], covered: boolean) {
  if (!covered) {
    return sites.filter((site) => site.coveredByPlan).map((site) => ({ id: site._id, status: "trial" as const, coveredByPlan: false }));
  }
  const free = AGENCY_SITES - sites.filter((site) => site.coveredByPlan).length;
  return sites
    .filter((site) => site.status === "trial" && !site.coveredByPlan)
    .slice(0, Math.max(0, free))
    .map((site) => ({ id: site._id, status: "active" as const, coveredByPlan: true }));
}
