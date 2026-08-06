import type { Response } from "express";

import { organizationService } from "../services/organization.service";

import type { AuthRequest } from "../types/auth";


/**
 * Organizations controller.
 *
 * Thin HTTP layer for organization endpoints.
 */
export const organizationsController = {
  /**
   * POST /api/v1/organizations  (authenticated)
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    const ownerId = req.user!.id;

    const name = req.body.name;

    const organization = await organizationService.createOrganization({
      name,

      ownerId,
    });

    res.status(201).json({ organization });
  },

  /**
   * GET /api/v1/organizations  (authenticated)
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    const ownerId = req.user!.id;

    const organizations = await organizationService.listOrganizations(ownerId);

    res.json({ organizations });
  },
};