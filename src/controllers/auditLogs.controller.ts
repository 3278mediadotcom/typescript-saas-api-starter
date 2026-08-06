import type { Request, Response } from "express";

import { auditLogService } from "../services/auditLog.service";


/**
 * AuditLogs controller.
 *
 * Thin HTTP layer. All routes here are admin-only
 * (enforced by the authorize middleware at the router).
 */
export const auditLogsController = {
  /**
   * GET /api/v1/audit-logs  (admin only)
   */
  async list(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId as string | undefined;

    const projectId = req.query.projectId as string | undefined;

    let logs;

    if (userId) {
      logs = await auditLogService.listByUser(userId);
    } else if (projectId) {
      logs = await auditLogService.listByProject(projectId);
    } else {
      logs = await auditLogService.listAll();
    }

    res.json({ auditLogs: logs });
  },
};