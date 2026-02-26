#!/usr/bin/env node

const args = process.argv.slice(2);

function getArg(name, fallback) {
  const prefix = `${name}=`;
  const found = args.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const target = getArg("--target", "production");
const serviceArg = getArg("--service", "all");
const requestedServices = serviceArg.split(",").map((value) => value.trim()).filter(Boolean);
const services = requestedServices.includes("all")
  ? ["web", "convex", "renderer"]
  : requestedServices;

const requiredByTarget = {
  local: {
    web: ["NEXT_PUBLIC_CONVEX_URL", "INTERNAL_SERVICE_SECRET"],
    convex: ["INTERNAL_SERVICE_SECRET", "DEV_BOOTSTRAP_SECRET", "RENDERER_SERVICE_URL"],
    renderer: [],
  },
  production: {
    web: [
      "NEXT_PUBLIC_CONVEX_URL",
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "CLERK_SECRET_KEY",
      "INTERNAL_SERVICE_SECRET",
      "DODO_API_KEY",
      "DODO_HOBBY_PRICE_ID",
      "DODO_PRO_PRICE_ID",
      "DODO_SCALE_PRICE_ID",
      "WEB_BASE_URL",
    ],
    convex: [
      "CONVEX_DEPLOYMENT",
      "INTERNAL_SERVICE_SECRET",
      "RENDERER_SERVICE_URL",
      "RENDERER_INTERNAL_TOKEN",
      "DODO_WEBHOOK_SECRET",
      "FIRECRAWL_API_KEY",
    ],
    renderer: [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
      "R2_PUBLIC_BASE_URL",
      "RENDERER_INTERNAL_TOKEN",
    ],
  },
};

const optionalWarnings = {
  local: {
    web: ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"],
    convex: ["DODO_WEBHOOK_SECRET", "FIRECRAWL_API_KEY"],
    renderer: ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_BASE_URL"],
  },
  production: {
    web: ["API_BASE_URL"],
    convex: [],
    renderer: ["NODE_ENV"],
  },
};

if (!Object.prototype.hasOwnProperty.call(requiredByTarget, target)) {
  console.error(`Invalid --target value '${target}'. Use local or production.`);
  process.exit(1);
}

for (const service of services) {
  if (!["web", "convex", "renderer"].includes(service)) {
    console.error(`Invalid service '${service}'. Use web, convex, renderer, or all.`);
    process.exit(1);
  }
}

const missing = [];
const warnings = [];

function isPresent(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function addMissing(service, key) {
  missing.push({ service, key });
}

function addWarning(service, message) {
  warnings.push({ service, message });
}

for (const service of services) {
  for (const key of requiredByTarget[target][service]) {
    if (!isPresent(process.env[key])) {
      addMissing(service, key);
    }
  }

  for (const key of optionalWarnings[target][service]) {
    if (!isPresent(process.env[key])) {
      addWarning(service, `Optional variable '${key}' is not set.`);
    }
  }
}

const r2Keys = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_BASE_URL",
];
const presentR2 = r2Keys.filter((key) => isPresent(process.env[key]));
if (presentR2.length > 0 && presentR2.length < r2Keys.length) {
  addWarning(
    "renderer",
    `R2 is partially configured (${presentR2.length}/${r2Keys.length} keys). Set all R2_* variables.`,
  );
}

if (target === "production" && services.includes("renderer")) {
  if (process.env.NODE_ENV !== "production") {
    addWarning("renderer", "NODE_ENV is not set to 'production' for renderer preflight.");
  }
}

if (missing.length > 0) {
  console.error(`Preflight failed for target='${target}' services=[${services.join(", ")}].`);
  for (const item of missing) {
    console.error(`- missing (${item.service}): ${item.key}`);
  }
  if (warnings.length > 0) {
    console.error("Warnings:");
    for (const item of warnings) {
      console.error(`- ${item.service}: ${item.message}`);
    }
  }
  process.exit(1);
}

console.log(`Preflight passed for target='${target}' services=[${services.join(", ")}].`);
if (warnings.length > 0) {
  console.log("Warnings:");
  for (const item of warnings) {
    console.log(`- ${item.service}: ${item.message}`);
  }
}
