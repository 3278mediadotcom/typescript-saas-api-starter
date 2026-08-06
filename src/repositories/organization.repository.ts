import type { Organization, Prisma } from "../generated/prisma/client";

import { prisma } from "../database/client";


/**
 * Organization repository.
 *
 * Only database access lives here:
 * no business rules, no HTTP concerns.
 */
export const organizationRepository = {
  /**
   * Find an organization by its unique ID.
   */
  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { id },
    });
  },

  /**
   * List all organizations owned by a given user.
   */
  async findByOwnerId(ownerId: string): Promise<Organization[]> {
    return prisma.organization.findMany({
      where: { ownerId },
    });
  },

  /**
   * Create a new organization.
   */
  async create(
    data: Prisma.OrganizationCreateInput
  ): Promise<Organization> {
    return prisma.organization.create({
      data,
    });
  },

  /**
   * Update an existing organization.
   */
  async update(
    id: string,
    data: Prisma.OrganizationUpdateInput
  ): Promise<Organization> {
    return prisma.organization.update({
      where: { id },

      data,
    });
  },

  /**
   * Delete an organization.
   */
  async delete(id: string): Promise<Organization> {
    return prisma.organization.delete({
      where: { id },
    });
  },
};