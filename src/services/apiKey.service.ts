import { AppError } from "../utils/AppError";

import { logger } from "../utils/logger";

import { apiKeyRepository } from "../repositories/apiKey.repository";

import { projectRepository } from "../repositories/project.repository";

import { auditLogRepository } from "../repositories/auditLog.repository";

import { createApiKeyPair, hashApiKey } from "../utils/apiKey";


/**
 * ApiKey service.
 *
 * Business rules live here. Typical flow:
 *
 *   Create API key
 *     ↓
 *   Project exists?  →  reject if not
 *     ↓
 *   Generate raw key + hash
 *     ↓
 *   Store ONLY the hash
 *     ↓
 *   Return raw key to caller (shown once)
 *     ↓
 *   Create audit log
 */
export const apiKeyService = {
  /**
   * Create an API key for a project.
   *
   * Returns the raw key ONLY once. After this call
   * it can never be retrieved again.
   */
  async createApiKey(params: {
    name: string;

    projectId: string;

    userId: string;

    expiresAt?: Date;
  }): Promise<unknown> {
    const { name, projectId, userId, expiresAt } = params;

    const project = await projectRepository.findById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    const { rawKey, keyHash } = createApiKeyPair();

    const apiKey = await apiKeyRepository.create({
      name,

      keyHash,

      ...(expiresAt !== undefined ? { expiresAt } : {}),

      project: {
        connect: { id: projectId },
      },
    });

    await auditLogRepository.create({
      action: "API_KEY_CREATED",

      user: {
        connect: { id: userId },
      },

      project: {
        connect: { id: projectId },
      },

      metadata: {
        apiKeyId: apiKey.id,

        name: apiKey.name,
      },
    });

    logger.info("API key created", {
      apiKeyId: apiKey.id,

      projectId,
    });

    return {
      apiKey,

      rawKey,
    };
  },

  /**
   * Validate a raw key by hashing it and looking up the hash.
   */
  async validateApiKey(rawKey: string): Promise<unknown> {
    const keyHash = hashApiKey(rawKey);

    const apiKey = await apiKeyRepository.findByKeyHash(keyHash);

    if (!apiKey) {
      throw new AppError("Invalid API key", 401, "INVALID_API_KEY");
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new AppError("API key has expired", 401, "API_KEY_EXPIRED");
    }

    await apiKeyRepository.updateLastUsed(apiKey.id);

    return apiKey;
  },

  /**
   * Revoke (delete) an API key.
   */
  async revokeApiKey(params: {
    apiKeyId: string;

    userId: string;
  }): Promise<void> {
    const { apiKeyId, userId } = params;

    const apiKey = await apiKeyRepository.findById(apiKeyId);

    if (!apiKey) {
      throw new AppError("API key not found", 404, "API_KEY_NOT_FOUND");
    }

    await apiKeyRepository.delete(apiKeyId);

    await auditLogRepository.create({
      action: "API_KEY_REVOKED",

      user: {
        connect: { id: userId },
      },

      project: {
        connect: { id: apiKey.projectId },
      },

      metadata: {
        apiKeyId,
      },
    });

    logger.info("API key revoked", { apiKeyId });
  },
};