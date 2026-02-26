const LIVE_PREFIX = "og_live_";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(hashBuffer));
}

export async function hashApiKey(rawKey: string): Promise<string> {
  return await sha256Hex(rawKey);
}

export async function createApiKey(): Promise<{ rawKey: string; keyPrefix: string; keyHash: string }> {
  const randomBytes = new Uint8Array(24);
  crypto.getRandomValues(randomBytes);
  const token = bytesToHex(randomBytes);
  const rawKey = `${LIVE_PREFIX}${token}`;
  const keyPrefix = rawKey.slice(0, 16);
  const keyHash = await hashApiKey(rawKey);
  return { rawKey, keyPrefix, keyHash };
}

export function safeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

export async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const keyData = new TextEncoder().encode(secret);
  const payloadData = new TextEncoder().encode(payload);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, payloadData);
  return bytesToHex(new Uint8Array(signature));
}

export async function verifyDodoSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): Promise<boolean> {
  if (!signature) return false;
  const expected = await hmacSha256Hex(secret, rawBody);
  return safeEqualString(expected, signature);
}
