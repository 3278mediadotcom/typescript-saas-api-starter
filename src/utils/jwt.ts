import jwt, { type SignOptions } from "jsonwebtoken";

import { config } from "../config/environment";

import { AppError } from "./AppError";


/**
 * JWT helpers.
 *
 * Encapsulates signing, verification, and expiration
 * so controllers/middleware never touch jsonwebtoken
 * implementation details.
 */

const JWT_SECRET = config.auth.jwtSecret;

const JWT_EXPIRES_IN = config.auth.jwtExpiresIn;


export interface JwtPayload {
  /** User ID (subject) */
  sub: string;

  /** User role for authorization (USER | ADMIN) */
  role: string;
}


/**
 * Sign a new access token.
 */
export function signToken(payload: JwtPayload): string {
  const options = {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions;

  return jwt.sign(payload, JWT_SECRET, options);
}


/**
 * Verify a token.
 *
 * Throws AppError(UNAUTHORIZED) for invalid, expired,
 * or malformed tokens so callers get the standardized
 * error shape.
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw new AppError("Invalid or expired token", 401, "UNAUTHORIZED");
  }
}