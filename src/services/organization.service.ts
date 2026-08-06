import { AppError } from "../utils/AppError";

import { logger } from "../utils/logger";

import { organizationRepository } from "../repositories/organization.repository";

import { userRepository } from "../repositories/user.repository";

import { auditLogRepository } from "../repositories/auditLog.repository";


/**
 * Organization service.
 *
 * Business rules live here. Typical flow:
 *
 *   Create organization
 *     ↓
 *   Owner exists?  →  reject if not
 *     ↓
 *   organizationRepository.create()
 *     ↓
 *   Create audit log
 *     ↓
 *   Return organization
 */
export const organizationService = {
  /**
   * Create an organization owned by a user.
   */
  async createOrganization(params: {
    name: string;

    ownerId: string;
  }): Promise<unknown> {
    const { name, ownerId } = params;

    const owner = await userRepository.findById(ownerId);

    if (!owner) {
      throw new AppError("Owner user not found", 404, "OWNER_NOT_FOUND");
    }

    const organization = await organizationRepository.create({
      name,

      owner: {
        connect: { id: ownerId },
      },
    });

    await auditLogRepository.create({
      action: "ORGANIZATION_CREATED",

      user: {
        connect: { id: ownerId },
      },

      metadata: {
        organizationId: organization.id,

        name: organization.name,
      },
    });

    logger.info("Organization created", {
      organizationId: organization.id,

      ownerId,
    });

    return organization;
  },

  /**
   * List organizations for a user.
   */
  async listOrganizations(ownerId: string): Promise<unknown> {
    return organizationRepository.findByOwnerId(ownerId);
  },
};