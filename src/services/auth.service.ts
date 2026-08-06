import { AppError } from "../utils/AppError";

import { logger } from "../utils/logger";

import { hashPassword, verifyPassword } from "../utils/password";

import { signToken } from "../utils/jwt";

import { userRepository } from "../repositories/user.repository";

import { auditLogRepository } from "../repositories/auditLog.repository";

import { toSafeUser } from "./user.service";


/**
 * Auth service.
 *
 * Registration flow:
 *   Validate input (done by controller/schema)
 *   → email exists? → reject
 *   → hash password (bcrypt)
 *   → create user
 *   → write USER_REGISTERED audit log
 *   → sign JWT
 *   → return token + safe user
 *
 * Login flow:
 *   Find user by email
 *   → compare bcrypt hash
 *   → sign JWT
 *   → write USER_LOGIN audit log
 *   → return token + safe user
 *
 * Auth errors use a generic message so we never reveal
 * whether the email or the password was wrong.
 */
export const authService = {
  /**
   * Register a new user and return a JWT.
   */
  async register(params: {
    email: string;

    password: string;
  }): Promise<unknown> {
    const { email, password } = params;

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

      role: "USER",
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

    const token = signToken({
      sub: user.id,

      role: user.role,
    });

    logger.info("User registered", { userId: user.id });

    return {
      token,

      user: toSafeUser(user),
    };
  },

  /**
   * Login an existing user and return a JWT.
   */
  async login(params: {
    email: string;

    password: string;
  }): Promise<unknown> {
    const { email, password } = params;

    const user = await userRepository.findByEmail(email);

    // Generic message: don't reveal whether email or password was wrong.
    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    await auditLogRepository.create({
      action: "USER_LOGIN",

      user: {
        connect: { id: user.id },
      },

      metadata: {
        email: user.email,
      },
    });

    const token = signToken({
      sub: user.id,

      role: user.role,
    });

    logger.info("User logged in", { userId: user.id });

    return {
      token,

      user: toSafeUser(user),
    };
  },
};