#!/usr/bin/env node

const apiBase = (process.env.API_BASE_URL || "").trim();
const apiKey = (process.env.OGSNAP_SMOKE_API_KEY || "").trim();
const internalSecret = (process.env.INTERNAL_SERVICE_SECRET || "").trim();
const renderUrl = (process.env.SMOKE_RENDER_URL || "https://example.com/post").trim();
const onboardingUrl = (process.env.SMOKE_ONBOARDING_URL || "").trim();
const convexBase = (process.env.SMOKE_CONVEX_BASE_URL || apiBase).trim();
const allowDataUrl = process.env.SMOKE_ALLOW_DATA_URL === "1";

if (!apiBase) {
  throw new Error("API_BASE_URL is required");
}

if (!apiKey) {
  throw new Error("OGSNAP_SMOKE_API_KEY is required");
}

const startedAt = Date.now();

function elapsedMs() {
  return Date.now() - startedAt;
}

async function fetchJson(url, init = {}, timeoutMs = 90_000) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  return { response, text, json };
}

async function smokeRender() {
  const { response, text, json } = await fetchJson(`${apiBase}/v1/render`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: renderUrl,
      title: "OGSnap Smoke Render",
      description: "Production smoke test",
    }),
  });

  if (!response.ok) {
    throw new Error(`Render smoke failed (${response.status}): ${text}`);
  }

  if (!json || typeof json.imageUrl !== "string" || json.imageUrl.length === 0) {
    throw new Error(`Render smoke returned invalid payload: ${text}`);
  }

  if (!allowDataUrl && json.imageUrl.startsWith("data:")) {
    throw new Error(
      "Render smoke returned data URL. Production renderer should return a persistent object URL (R2/CDN).",
    );
  }

  console.log(
    `[ok] render smoke passed in ${elapsedMs()}ms (cacheHit=${Boolean(json.cacheHit)} url=${json.imageUrl.slice(0, 96)})`,
  );
}

async function smokeRenderMultiAndPolish() {
  console.log("Starting multi-size & AI polish render smoke test...");
  const { response, text, json } = await fetchJson(`${apiBase}/v1/render`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: renderUrl,
      title: "OGSnap Smoke Multi-Render",
      description: "Testing multi size and AI polish rendering",
      multi: true,
      polish: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Multi-render smoke failed (${response.status}): ${text}`);
  }

  if (!json || typeof json.images !== "object" || json.images === null) {
    throw new Error(`Multi-render smoke returned invalid payload (missing images): ${text}`);
  }

  const expectedSizes = ["og", "twitter", "linkedin", "slack", "discord", "square", "story"];
  for (const size of expectedSizes) {
    if (typeof json.images[size] !== "string" || json.images[size].length === 0) {
      throw new Error(`Multi-render smoke payload missing size ${size}: ${text}`);
    }
  }

  const hasLlmKey = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
  if (hasLlmKey) {
    if (!json.metadata || typeof json.metadata.altText !== "string" || json.metadata.altText.length === 0) {
      throw new Error(`Multi-render smoke payload missing or invalid AI altText: ${text}`);
    }
    if (typeof json.metadata.twitterCopy !== "string" || json.metadata.twitterCopy.length === 0) {
      throw new Error(`Multi-render smoke payload missing or invalid AI twitterCopy: ${text}`);
    }
    if (typeof json.metadata.linkedinCopy !== "string" || json.metadata.linkedinCopy.length === 0) {
      throw new Error(`Multi-render smoke payload missing or invalid AI linkedinCopy: ${text}`);
    }
  } else {
    console.log("[info] Skipping AI metadata assertion as LLM API keys are not set in environment");
  }

  console.log(
    `[ok] multi-size + AI polish render smoke passed in ${elapsedMs()}ms (7 sizes verified)`
  );
}

async function smokeInternalSyncAndOnboarding() {
  if (!internalSecret) {
    console.log("[skip] internal sync/onboarding smoke (INTERNAL_SERVICE_SECRET not set)");
    return;
  }

  const clerkId = (process.env.OGSNAP_SMOKE_CLERK_ID || `smoke_${Date.now()}`).trim();
  const sync = await fetchJson(`${convexBase}/v1/internal/sync-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": internalSecret,
    },
    body: JSON.stringify({
      clerkId,
      email: process.env.OGSNAP_SMOKE_EMAIL || "smoke@ogsnap.dev",
      firstName: "Smoke",
      lastName: "Test",
      fullName: "Smoke Test",
    }),
  });

  if (!sync.response.ok) {
    throw new Error(`sync-user smoke failed (${sync.response.status}): ${sync.text}`);
  }

  if (!sync.json || typeof sync.json.userId !== "string" || sync.json.userId.length === 0) {
    throw new Error(`sync-user smoke returned invalid payload: ${sync.text}`);
  }

  console.log(`[ok] sync-user smoke passed in ${elapsedMs()}ms (userId=${sync.json.userId})`);

  if (!onboardingUrl) {
    console.log("[skip] onboarding smoke (SMOKE_ONBOARDING_URL not set)");
    return;
  }

  const onboarding = await fetchJson(`${convexBase}/v1/onboarding/magic`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": internalSecret,
    },
    body: JSON.stringify({
      userId: sync.json.userId,
      url: onboardingUrl,
    }),
  });

  if (!onboarding.response.ok) {
    throw new Error(`onboarding smoke failed (${onboarding.response.status}): ${onboarding.text}`);
  }

  if (!onboarding.json || onboarding.json.success !== true) {
    throw new Error(`onboarding smoke returned invalid payload: ${onboarding.text}`);
  }

  console.log(
    `[ok] onboarding smoke passed in ${elapsedMs()}ms (brandKitId=${String(
      onboarding.json.brandKitId || "",
    )})`,
  );
}

try {
  await smokeRender();
  await smokeRenderMultiAndPolish();
  await smokeInternalSyncAndOnboarding();
  console.log(`Smoke suite passed in ${elapsedMs()}ms`);
} catch (error) {
  console.error(`Smoke suite failed after ${elapsedMs()}ms`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
