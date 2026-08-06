import type { Prisma, Project } from "../generated/prisma/client";

import { prisma } from "../database/client";


/**
 * Project repository.
 *
 * Only database access lives here:
 * no business rules, no HTTP concerns.
 */
export const projectRepository = {
  /**
   * Find a project by its unique ID.
   */
  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
    });
  },

  /**
   * List all projects belonging to an organization.
   */
  async findByOrganizationId(organizationId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { organizationId },
    });
  },

  /**
   * Create a new project.
   */
  async create(
    data: Prisma.ProjectCreateInput
  ): Promise<Project> {
    return prisma.project.create({
      data,
    });
  },

  /**
   * Update an existing project.
   */
  async update(
    id: string,
    data: Prisma.ProjectUpdateInput
  ): Promise<Project> {
    return prisma.project.update({
      where: { id },

      data,
    });
  },

  /**
   * Delete a project.
   */
  async delete(id: string): Promise<Project> {
    return prisma.project.delete({
      where: { id },
    });
  },
};