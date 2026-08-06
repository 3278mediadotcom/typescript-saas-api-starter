import { Router } from "express";

import { usersController } from "../controllers/users.controller";

import { authenticate } from "../middleware/authenticate";

import { authorize } from "../middleware/authorize";


const router = Router();


/**
 * All user routes require authentication.
 */
router.use(authenticate);


/**
 * GET /api/v1/users/me  (authenticated)
 */
router.get("/me", usersController.me);


/**
 * DELETE /api/v1/users/:id  (admin only)
 */
router.delete("/:id", authorize("ADMIN"), usersController.delete);


export default router;