import { AppError } from "../utils/AppError";

import { logger } from "../utils/logger";

import { projectRepository } from "../repositories/project.repository";

import { organizationRepository } from "../repositories/organization.repository";

import { auditLogRepository } from "../repositories/auditLog.repository";


/**
 * Project service.
 *
 * Business rules live here. Typical flow:
 *
 *   Create project
 *     ↓
 *   Organization exists?  →  reject if not
 *     ↓
 *   projectRepository.create()
 *     ↓
 *   Create audit log
 *     ↓
 *   Return project
 */
export const projectService = {
  /**
   * Create a project inside an organization.
   */
  async createProject(params: {
    name: string;

    description?: string;

    organizationId: string;

    userId: string;
  }): Promise<unknown> {
    const { name, description, organizationId, userId } = params;

    const organization = await organizationRepository.findById(organizationId);

    if (!organization) {
      throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
    }

    const project = await projectRepository.create({
      name,

      ...(description !== undefined && description !== ""
        ? { description }
        : {}),

      organization: {
        connect: { id: organizationId },
      },
    });

    await auditLogRepository.create({
      action: "PROJECT_CREATED",

      user: {
        connect: { id: userId },
      },

      project: {
        connect: { id: project.id },
      },

      metadata: {
        organizationId,

        name: project.name,
      },
    });

    logger.info("Project created", {
      projectId: project.id,

      organizationId,
    });

    return project;
  },

  /**
   * List projects for an organization.
   */
  async listProjects(organizationId: string): Promise<unknown> {
    return projectRepository.findByOrganizationId(organizationId);
  },
};