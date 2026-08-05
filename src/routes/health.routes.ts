import { Router } from "express";


const router = Router();


/**
 * GET /api/v1/health
 *
 * Liveness check for load balancers, orchestrators,
 * and uptime monitors.
 */
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",

    service: "typescript-saas-api-starter",

    timestamp: new Date().toISOString(),
  });
});


export default router;