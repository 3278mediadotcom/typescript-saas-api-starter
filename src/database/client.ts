import { PrismaClient } from "../generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

import { config } from "../config/environment";


/**
 * Prisma Client singleton wired to PostgreSQL
 * through the PrismaPg driver adapter (Prisma 7).
 *
 * The adapter gives us full control over the connection
 * pool and SSL settings while keeping Prisma's type-safe
 * query API.
 */

// Create the pg adapter with the connection string from config
const adapter = new PrismaPg({
  connectionString: config.database.url,
});


// Export a single shared instance so all repositories
// use the same connection pool
export const prisma = new PrismaClient({ adapter });


/**
 * Optional: graceful shutdown helper to close the pool
 * cleanly when the process exits.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}