import { AppError } from "../utils/AppError";

import { hashPassword } from "../utils/password";

import { logger } from "../utils/logger";

import { userRepository } from "../repositories/user.repository";

import { auditLogRepository } from "../repositories/auditLog.repository";

import type { UserRole } from "../generated/prisma/client";


/**
 * User service.
 *
 * Business rules live here. This layer may call
 * multiple repositories and enforce invariants:
 *
 *   Register user
 *     ↓
 *   Email already exists?  →  reject
 *     ↓
 *   Hash password
 *     ↓
 *   userRepository.create()
 *     ↓
 *   auditLogRepository.create()
 *     ↓
 *   Return user
 */
export const userService = {
  /**
   * Register a new user.
   */
  async registerUser(params: {
    email: string;

    password: string;

    role?: UserRole;
  }): Promise<unknown> {
    const { email, password, role = "USER" } = params;

    const existing = await userRepository.findByEmail(email);

    if (existing) {
      throw new AppError(
        "An account with this email already exists",
        409,
        "EMAIL_TAKEN"
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
      email,

      passwordHash,

      role,
    });

    await auditLogRepository.create({
      action: "USER_REGISTERED",

      user: {
        connect: { id: user.id },
      },

      metadata: {
        email: user.email,
      },
    });

    logger.info("User registered", { userId: user.id });

    return user;
  },

  /**
   * Get a user's profile by ID.
   */
  async getProfile(userId: string): Promise<unknown> {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return user;
  },
};