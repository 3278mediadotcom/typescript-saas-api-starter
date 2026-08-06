import { Router } from "express";

import { auditLogsController } from "../controllers/auditLogs.controller";

import { authenticate } from "../middleware/authenticate";

import { authorize } from "../middleware/authorize";


const router = Router();


/**
 * All audit-log routes require authentication AND admin role.
 */
router.use(authenticate, authorize("ADMIN"));


/**
 * GET /api/v1/audit-logs  (admin only)
 *
 * Query params (optional):
 *   ?userId=<id>      filter by user
 *   ?projectId=<id>   filter by project
 */
router.get("/", auditLogsController.list);


export default router;