import express from "express";

import cors from "cors";

import helmet from "helmet";

import { config } from "./config/environment";

import { notFound } from "./middleware/notFound";

import { errorHandler } from "./middleware/errorHandler";


/**
 * Express application factory.
 *
 * Kept separate from server.ts so tests can import
 * the app without binding to a port.
 */
export function createApp(): express.Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // JSON body parsing
  app.use(express.json());

  // CORS for frontend communication
  app.use(
    cors({
      origin: config.cors.origin,
    })
  );

  // Root — basic API info
  app.get("/", (_req, res) => {
    res.json({
      service: "typescript-saas-api-starter",

      version: "1.0.0",

      docs: "See README.md for API reference",

      endpoints: ["/health"],
    });
  });

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",

      service: "typescript-saas-api-starter",
    });
  });

  // Favicon: APIs don't serve one, but return 204 so
  // browsers don't fall through to the 404 handler
  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  // 404 for unmatched routes
  app.use(notFound);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}


export const app = createApp();