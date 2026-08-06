import { Router } from "express";

import healthRoutes from "./health.routes";

import authRoutes from "./auth.routes";

import usersRoutes from "./users.routes";

import organizationsRoutes from "./organizations.routes";

import auditLogsRoutes from "./auditLogs.routes";


/**
 * API v1 router.
 *
 * All versioned routes are mounted here so the rest
 * of the app only needs `app.use("/api/v1", routes)`.
 */
const router = Router();


router.use(healthRoutes);

router.use("/auth", authRoutes);

router.use("/users", usersRoutes);

router.use("/organizations", organizationsRoutes);

router.use("/audit-logs", auditLogsRoutes);


export default router;