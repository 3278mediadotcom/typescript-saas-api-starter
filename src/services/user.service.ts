import { AppError } from "../utils/AppError";

import { logger } from "../utils/logger";

import { userRepository } from "../repositories/user.repository";

import { auditLogRepository } from "../repositories/auditLog.repository";


/**
 * User service.
 *
 * Business rules for user management (non-auth):
 * profile lookup, admin deletion, audit logging.
 *
 * Register/login live in auth.service.
 */
export const userService = {
  /**
   * Get a user's public profile by ID.
   */
  async getProfile(userId: string): Promise<unknown> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return toSafeUser(user);
  },

  /**
   * Delete a user (admin only).
   */
  async deleteUser(params: {
    userId: string;

    actorId: string;
  }): Promise<void> {
    const { userId, actorId } = params;

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    await userRepository.delete(userId);

    await auditLogRepository.create({
      action: "USER_DELETED",

      user: {
        connect: { id: actorId },
      },

      metadata: {
        deletedUserId: userId,

        deletedEmail: user.email,
      },
    });

    logger.info("User deleted", { deletedUserId: userId });
  },
};


/**
 * Strip sensitive fields (passwordHash) before returning.
 */
export function toSafeUser(user: {
  id: string;

  email: string;

  role: string;

  createdAt: Date;

  updatedAt: Date;
}): object {
  return {
    id: user.id,

    email: user.email,

    role: user.role,

    createdAt: user.createdAt,

    updatedAt: user.updatedAt,
  };
}