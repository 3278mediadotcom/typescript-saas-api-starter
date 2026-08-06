import type { Request } from "express";


/**
 * The user attached to a request by the authenticate
 * middleware, after JWT verification and DB lookup.
 */
export interface AuthenticatedUser {
  id: string;

  email: string;

  role: string;
}


/**
 * Authenticated request.
 *
 * `user` is set by the authenticate middleware and is
 * present on protected routes.
 */
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}