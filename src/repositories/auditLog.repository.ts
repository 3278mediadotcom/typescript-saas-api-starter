import type { AuditLog, Prisma } from "../generated/prisma/client";

import { prisma } from "../database/client";


/**
 * AuditLog repository.
 *
 * Only database access lives here:
 * no business rules, no HTTP concerns.
 */
export const auditLogRepository = {
  /**
   * Find an audit log entry by its unique ID.
   */
  async findById(id: string): Promise<AuditLog | null> {
    return prisma.auditLog.findUnique({
      where: { id },
    });
  },

  /**
   * List audit logs by project, newest first.
   */
  async findByProjectId(projectId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { projectId },

      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * List audit logs by user, newest first.
   */
  async findByUserId(userId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { userId },

      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Create an audit log entry.
   */
  async create(
    data: Prisma.AuditLogCreateInput
  ): Promise<AuditLog> {
    return prisma.auditLog.create({
      data,
    });
  },
};