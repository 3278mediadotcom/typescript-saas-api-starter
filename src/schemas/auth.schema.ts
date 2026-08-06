import { z } from "zod";


/**
 * POST /api/v1/auth/register
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),

  password: z.string().min(8, "Password must be at least 8 characters"),
});


/**
 * POST /api/v1/auth/login
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),

  password: z.string().min(1, "Password is required"),
});


export type RegisterInput = z.infer<typeof registerSchema>;

export type LoginInput = z.infer<typeof loginSchema>;