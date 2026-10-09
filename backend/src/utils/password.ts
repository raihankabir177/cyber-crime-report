import crypto from "crypto";

const DEFAULT_ITERATIONS = 600000;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, DEFAULT_ITERATIONS, 32, "sha256")
    .toString("hex");
  return `pbkdf2:sha256:${DEFAULT_ITERATIONS}$${salt}$${hash}`;
}

/** Compatible with Werkzeug / Flask password hashes (pbkdf2:sha256). */
export function verifyPassword(stored: string, password: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3) {
    return false;
  }
  const [method, salt, expectedHash] = parts;
  if (!method.startsWith("pbkdf2:sha256")) {
    return false;
  }
  const iterationPart = method.split(":")[2];
  const iterations = parseInt(iterationPart, 10);
  if (!iterations || !salt || !expectedHash) {
    return false;
  }
  const derived = crypto
    .pbkdf2Sync(password, salt, iterations, 32, "sha256")
    .toString("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(derived, "hex"),
      Buffer.from(expectedHash, "hex")
    );
  } catch {
    return derived === expectedHash;
  }
}
