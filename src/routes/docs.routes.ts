import { Router } from "express";

import swaggerUi from "swagger-ui-express";

import { openApiSpec } from "../docs/openapi";


const router = Router();


/**
 * GET /api/v1/docs/json → raw OpenAPI spec.
 * Defined BEFORE swagger-ui so it isn't shadowed.
 */
router.get("/docs/json", (_req, res) => {
  res.json(openApiSpec);
});


/**
 * GET /api/v1/docs  → interactive Swagger UI
 */
router.use(
  "/docs",

  swaggerUi.serve,

  swaggerUi.setup(openApiSpec)
);


export default router;