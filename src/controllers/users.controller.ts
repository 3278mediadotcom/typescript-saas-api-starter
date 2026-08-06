import type { Response } from "express";

import { userService } from "../services/user.service";

import type { AuthRequest } from "../types/auth";


/**
 * Users controller.
 *
 * Thin HTTP layer for user management endpoints.
 */
export const usersController = {
  /**
   * GET /api/v1/users/me
   */
  async me(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.id;

    const profile = await userService.getProfile(userId);

    res.json({ user: profile });
  },

  /**
   * DELETE /api/v1/users/:id  (admin only)
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    const actorId = req.user!.id;

    const userId = String(req.params.id);

    await userService.deleteUser({ userId, actorId });

    res.status(204).end();
  },
};