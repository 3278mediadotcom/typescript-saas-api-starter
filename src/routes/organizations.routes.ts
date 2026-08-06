import { Router } from "express";

import { organizationsController } from "../controllers/organizations.controller";

import { authenticate } from "../middleware/authenticate";

import { validate } from "../middleware/validate";

import { createOrganizationSchema } from "../schemas/organization.schema";


const router = Router();


/**
 * All organization routes require authentication.
 */
router.use(authenticate);


/**
 * POST /api/v1/organizations  (authenticated)
 */
router.post(
  "/",

  validate(createOrganizationSchema),

  organizationsController.create
);


/**
 * GET /api/v1/organizations  (authenticated)
 */
router.get("/", organizationsController.list);


export default router;