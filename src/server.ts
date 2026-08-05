import { createApp } from "./app";

import { config } from "./config/environment";

import { logger } from "./utils/logger";

import { disconnectDatabase } from "./database/client";


/**
 * Server entry point.
 *
 * Starts the HTTP server and wires up graceful
 * shutdown on SIGTERM/SIGINT so connections and
 * the database pool close cleanly.
 */
const app = createApp();

const port = config.server.port;


const server = app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`, {
    environment: config.server.nodeEnv,
  });
});


async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down gracefully`);

  server.close(async () => {
    await disconnectDatabase();

    logger.info("Server closed");

    process.exit(0);
  });
}


process.on("SIGTERM", () => void shutdown("SIGTERM"));

process.on("SIGINT", () => void shutdown("SIGINT"));