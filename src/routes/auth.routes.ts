import { Router } from "express";

import { authController } from "../controllers/auth.controller";

import { validate } from "../middleware/validate";

import { authenticate } from "../middleware/authenticate";

import { loginSchema, registerSchema } from "../schemas/auth.schema";


const router = Router();


/**
 * POST /api/v1/auth/register  (public)
 */
router.post("/register", validate(registerSchema), authController.register);


/**
 * POST /api/v1/auth/login  (public)
 */
router.post("/login", validate(loginSchema), authController.login);


/**
 * GET /api/v1/auth/me  (authenticated)
 */
router.get("/me", authenticate, authController.me);


export default router;