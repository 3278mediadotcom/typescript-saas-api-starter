import { z } from "zod";


/**
 * POST /api/v1/organizations
 */
export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});


export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;