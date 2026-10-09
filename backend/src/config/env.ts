import dotenv from "dotenv";
import path from "path";

import fs from "fs";

// Determine potential paths for env files (backend dir or repo root)
const backendDir = path.resolve(__dirname, "../..");
const rootDir = path.resolve(__dirname, "../../..");

const isProd = process.env.NODE_ENV === "production";
const envFileName = isProd ? ".env.production" : ".env";

const candidatePaths = [
  path.join(backendDir, envFileName),
  path.join(rootDir, envFileName),
  path.join(backendDir, ".env"),
  path.join(rootDir, ".env"),
];

for (const envPath of candidatePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}
// Also invoke dotenv without path to capture any default .env in cwd or environment
dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const SESSION_COOKIE = "ccr.sid";

const isVercel = Boolean(process.env.VERCEL);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isVercel,
  port: parseInt(process.env.PORT || "5000", 10),
  secretKey: process.env.SECRET_KEY || "dev_secret_change_me",
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean),
  // Vercel functions reject request bodies over ~4.5 MB.
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || (isVercel ? "4" : "25"), 10),
  // Admin self-registration is disabled unless this code is set and matched.
  adminSignupCode: process.env.ADMIN_SIGNUP_CODE || "",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};

export function assertCoreEnv(): void {
  requireEnv("DATABASE_URL");
  requireEnv("SECRET_KEY");
  if (env.isProduction) {
    if (env.secretKey.length < 32 || env.secretKey.startsWith("dev_secret")) {
      throw new Error("SECRET_KEY must be a random string of at least 32 characters in production");
    }
    requireEnv("CORS_ORIGINS");
  }
}

export function cloudinaryConfigured(): boolean {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  return Boolean(cloudName && apiKey && apiSecret);
}
