import { httpRouter } from "convex/server";
import { renderCorsPreflight, renderImage } from "./render/http";
import { dodoWebhook } from "./billing/webhooks";
import { bootstrapDemo } from "./dev/http";
import { magicOnboarding } from "./onboarding/http";
import { createLead } from "./leads/http";
import { siteImage } from "./sites/http";
import { syncUserFromIdentity } from "./users/http";
import { getDashboardData } from "./dashboard/http";

const http = httpRouter();

http.route({
  path: "/v1/render",
  method: "POST",
  handler: renderImage,
});

http.route({
  path: "/v1/render",
  method: "OPTIONS",
  handler: renderCorsPreflight,
});

http.route({
  path: "/webhooks/dodo",
  method: "POST",
  handler: dodoWebhook,
});

http.route({
  path: "/v1/dev/bootstrap",
  method: "POST",
  handler: bootstrapDemo,
});

http.route({
  path: "/v1/onboarding/magic",
  method: "POST",
  handler: magicOnboarding,
});

http.route({
  path: "/v1/internal/sync-user",
  method: "POST",
  handler: syncUserFromIdentity,
});

http.route({
  path: "/v1/internal/dashboard",
  method: "POST",
  handler: getDashboardData,
});

http.route({
  path: "/v1/internal/leads",
  method: "POST",
  handler: createLead,
});

http.route({
  pathPrefix: "/v1/site/",
  method: "GET",
  handler: siteImage,
});

export default http;
