import type { Request, Response, NextFunction } from "express";

import type { ZodSchema } from "zod";

import { AppError } from "../utils/AppError";


/**
 * Request validation middleware.
 *
 * Validates `req.body` against a Zod schema before the
 * request reaches the controller/service. Malformed
 * payloads are rejected immediately with a consistent
 * INVALID_PAYLOAD error.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];

      const message = firstIssue
        ? firstIssue.message
        : "Invalid request payload";

      throw new AppError(message, 400, "INVALID_PAYLOAD");
    }

    // Attach validated data so downstream layers never re-parse
    req.body = result.data;

    next();
  };
}