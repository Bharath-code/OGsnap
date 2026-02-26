const apiBase = process.env.API_BASE_URL ?? "http://127.0.0.1:3210";
const apiKey = process.env.OGSNAP_DEMO_KEY;

if (!apiKey) {
  throw new Error("OGSNAP_DEMO_KEY is required");
}

const response = await fetch(`${apiBase}/v1/render`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://example.com/post",
    title: "Smoke Test",
    description: "OGSnap v1 render smoke test",
  }),
});

if (!response.ok) {
  throw new Error(`render failed: ${response.status} ${await response.text()}`);
}

console.log(await response.json());
