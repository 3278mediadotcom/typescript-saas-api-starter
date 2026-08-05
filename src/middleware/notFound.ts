import type { Request, Response, NextFunction } from "express";

import { AppError } from "../utils/AppError";


/**
 * 404 handler for unmatched routes.
 *
 * Throws a NOT_FOUND AppError which is caught by
 * the global error handler and returned as structured JSON.
 */
export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(
    new AppError(
      "Route not found",
      404,
      "NOT_FOUND"
    )
  );
}