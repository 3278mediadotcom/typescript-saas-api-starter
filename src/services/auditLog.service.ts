import { auditLogRepository } from "../repositories/auditLog.repository";


/**
 * AuditLog service.
 *
 * Business rules for audit trail access:
 * listing logs scoped by user or project.
 */
export const auditLogService = {
  /**
   * List audit logs for a user, newest first.
   */
  async listByUser(userId: string): Promise<unknown> {
    return auditLogRepository.findByUserId(userId);
  },

  /**
   * List audit logs for a project, newest first.
   */
  async listByProject(projectId: string): Promise<unknown> {
    return auditLogRepository.findByProjectId(projectId);
  },
};