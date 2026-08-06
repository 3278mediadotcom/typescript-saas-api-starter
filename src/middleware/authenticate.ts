import type { Response, NextFunction } from "express";

import { AppError } from "../utils/AppError";

import { verifyToken } from "../utils/jwt";

import { userRepository } from "../repositories/user.repository";

import type { AuthRequest } from "../types/auth";


/**
 * Authentication middleware.
 *
 * Responsibilities:
 * 1. Read the `Authorization: Bearer <token>` header.
 * 2. Validate the Bearer format.
 * 3. Verify the JWT.
 * 4. Load the user from the repository.
 * 5. Attach the authenticated user to `req.user`.
 * 6. Reject invalid/expired tokens with the standardized error.
 */
export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;

    if (!header) {
      throw new AppError("Missing authorization header", 401, "UNAUTHORIZED");
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("Invalid authorization header", 401, "UNAUTHORIZED");
    }

    const payload = verifyToken(token);

    // Load the user fresh from DB so revoked/deleted users are rejected.
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new AppError("User not found", 401, "UNAUTHORIZED");
    }

    req.user = {
      id: user.id,

      email: user.email,

      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}