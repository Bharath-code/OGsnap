import type { AuthConfig } from "convex/server";

// Lets ctx.auth read Clerk sessions. Needs a Clerk JWT template named "convex" and
// CLERK_JWT_ISSUER_DOMAIN (that template's issuer URL) set on each Convex deployment.
export default {
  providers: [{ domain: process.env.CLERK_JWT_ISSUER_DOMAIN!, applicationID: "convex" }],
} satisfies AuthConfig;
