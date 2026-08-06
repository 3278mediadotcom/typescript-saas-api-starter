import { createHash, randomBytes } from "crypto";


/**
 * API key generation helpers.
 *
 * Security model:
 * - The raw key (e.g. `sk_live_a1b2c3...`) is shown to the
 *   user exactly once at creation time.
 * - Only the SHA-256 hash of the key is stored in the database.
 * - If the DB is leaked, the hashes cannot be reversed.
 */

const KEY_PREFIX = "sk_live";


/**
 * Generate a new raw API key.
 *
 * Format: sk_live_<32 random hex chars>
 */
export function generateApiKey(): string {
  const entropy = randomBytes(24).toString("hex");

  return `${KEY_PREFIX}_${entropy}`;
}


/**
 * Hash a raw API key for storage.
 */
export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}


/**
 * Create a fresh key pair: raw key for the response,
 * hash for the database.
 */
export function createApiKeyPair(): { rawKey: string; keyHash: string } {
  const rawKey = generateApiKey();

  return {
    rawKey,

    keyHash: hashApiKey(rawKey),
  };
}