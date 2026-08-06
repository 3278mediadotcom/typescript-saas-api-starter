import type { Response } from "express";

import { authService } from "../services/auth.service";

import type { AuthRequest } from "../types/auth";


/**
 * Auth controller.
 *
 * Thin HTTP layer: parses validated input, delegates to
 * the auth service, returns a response. No business logic.
 */
export const authController = {
  /**
   * POST /api/v1/auth/register
   */
  async register(req: AuthRequest, res: Response): Promise<void> {
    const { email, password } = req.body;

    const result = await authService.register({ email, password });

    res.status(201).json(result);
  },

  /**
   * POST /api/v1/auth/login
   */
  async login(req: AuthRequest, res: Response): Promise<void> {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.status(200).json(result);
  },

  /**
   * GET /api/v1/auth/me
   */
  async me(req: AuthRequest, res: Response): Promise<void> {
    res.json({ user: req.user });
  },
};