import { Router } from "express";

import healthRoutes from "./health.routes";


/**
 * API v1 router.
 *
 * All versioned routes are mounted here so the rest
 * of the app only needs `app.use("/api/v1", routes)`.
 *
 * New feature routes (auth, users, projects, apiKeys)
 * get mounted here as they are built.
 */
const router = Router();


router.use(healthRoutes);


export default router;