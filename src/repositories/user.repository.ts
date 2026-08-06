import type { Prisma, User } from "../generated/prisma/client";

import { prisma } from "../database/client";


/**
 * User repository.
 *
 * Only database access lives here:
 * no auth, no validation, no business logic.
 */
export const userRepository = {
  /**
   * Find a user by their unique ID.
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Find a user by their unique email.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * Create a new user.
   */
  async create(
    data: Prisma.UserCreateInput
  ): Promise<User> {
    return prisma.user.create({
      data,
    });
  },

  /**
   * Update an existing user.
   */
  async update(
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    return prisma.user.update({
      where: { id },

      data,
    });
  },

  /**
   * Delete a user.
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  },
};