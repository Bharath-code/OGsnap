import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: string;
  prefix: string;
}

let r2Client: S3Client | null = null;

function optionalString(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function getR2Config(): R2Config | null {
  const accountId = optionalString(process.env.R2_ACCOUNT_ID);
  const accessKeyId = optionalString(process.env.R2_ACCESS_KEY_ID);
  const secretAccessKey = optionalString(process.env.R2_SECRET_ACCESS_KEY);
  const bucketName = optionalString(process.env.R2_BUCKET_NAME);
  const publicBaseUrl = optionalString(process.env.R2_PUBLIC_BASE_URL);
  const prefix = optionalString(process.env.R2_PREFIX) ?? "renders";

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl,
    prefix,
  };
}

function getR2Client(config: R2Config): S3Client {
  if (r2Client) {
    return r2Client;
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return r2Client;
}

function buildObjectKey(prefix: string): string {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${prefix}/${year}/${month}/${day}/${Date.now()}-${randomUUID()}.png`;
}

function withTrailingSlashRemoved(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function dataUrlFallback(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function storeImage(buffer: Buffer): Promise<string> {
  const config = getR2Config();
  const isProd = process.env.NODE_ENV === "production";

  if (!config) {
    if (isProd) {
      throw new Error("R2 storage is not fully configured in production");
    }
    return dataUrlFallback(buffer);
  }

  const key = buildObjectKey(config.prefix);
  const client = getR2Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: buffer,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${withTrailingSlashRemoved(config.publicBaseUrl)}/${key}`;
}
