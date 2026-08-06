import type { ApiKey, Prisma } from "../generated/prisma/client";

import { prisma } from "../database/client";


/**
 * ApiKey repository.
 *
 * Only database access lives here:
 * no business rules, no HTTP concerns.
 *
 * IMPORTANT: only the HASHED key is stored — raw
 * keys are never persisted.
 */
export const apiKeyRepository = {
  /**
   * Find an API key by its unique ID.
   */
  async findById(id: string): Promise<ApiKey | null> {
    return prisma.apiKey.findUnique({
      where: { id },
    });
  },

  /**
   * Find an API key by its hashed value.
   */
  async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
    return prisma.apiKey.findUnique({
      where: { keyHash },
    });
  },

  /**
   * List all API keys belonging to a project.
   */
  async findByProjectId(projectId: string): Promise<ApiKey[]> {
    return prisma.apiKey.findMany({
      where: { projectId },
    });
  },

  /**
   * Create a new API key (store the hash, not the raw key).
   */
  async create(
    data: Prisma.ApiKeyCreateInput
  ): Promise<ApiKey> {
    return prisma.apiKey.create({
      data,
    });
  },

  /**
   * Touch the lastUsedAt timestamp.
   */
  async updateLastUsed(id: string): Promise<ApiKey> {
    return prisma.apiKey.update({
      where: { id },

      data: {
        lastUsedAt: new Date(),
      },
    });
  },

  /**
   * Delete an API key.
   */
  async delete(id: string): Promise<ApiKey> {
    return prisma.apiKey.delete({
      where: { id },
    });
  },
};