import type { Response, NextFunction } from "express";

import { AppError } from "../utils/AppError";

import type { AuthRequest } from "../types/auth";


/**
 * Authorization middleware factory.
 *
 * Usage:
 *   authorize("ADMIN")
 *   authorize("USER", "ADMIN")
 *
 * Must run AFTER authenticate so `req.user` is populated.
 * Compares the authenticated user's role against the
 * allowed roles; rejects with 403 FORBIDDEN otherwise.
 */
export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        "You do not have permission to access this resource",
        403,
        "FORBIDDEN"
      );
    }

    next();
  };
}