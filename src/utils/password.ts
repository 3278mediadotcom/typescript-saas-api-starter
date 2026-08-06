import bcrypt from "bcrypt";


/**
 * Password hashing helpers.
 *
 * Uses bcrypt with the recommended cost factor.
 * Passwords are never stored in plain text.
 */
const SALT_ROUNDS = 10;


/**
 * Hash a plain-text password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}


/**
 * Compare a plain-text password against a stored hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}