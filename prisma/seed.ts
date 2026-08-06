/**
 * Seed script.
 *
 * Creates a realistic multi-tenant dataset:
 *
 *   Admin User
 *     ↓
 *   3278Media Organization
 *     ↓
 *   Developer Portal Project
 *     ↓
 *   Production API Key (hash only)
 *     ↓
 *   Initial Audit Log
 *
 * Idempotent: safe to run multiple times (uses upsert).
 *
 * Run with: npm run db:seed
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

import { hashApiKey } from "../src/utils/apiKey";

import { hashPassword } from "../src/utils/password";


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});


const prisma = new PrismaClient({ adapter });


async function main(): Promise<void> {
  console.log("\n=== Seeding database ===\n");

  // 1. Admin user (upsert by email so re-runs don't duplicate)
  const adminPasswordHash = await hashPassword("AdminPassword123!");

  const admin = await prisma.user.upsert({
    where: { email: "admin@3278media.com" },

    update: {},

    create: {
      email: "admin@3278media.com",

      passwordHash: adminPasswordHash,

      role: "ADMIN",
    },
  });

  console.log("✓ Admin user:", admin.email);


  // 2. Organization owned by the admin
  const organization = await prisma.organization.upsert({
    where: { id: "org_3278media_prod" },

    update: {},

    create: {
      id: "org_3278media_prod",

      name: "3278Media",

      ownerId: admin.id,
    },
  });

  console.log("✓ Organization:", organization.name);


  // 3. Project inside the organization
  const project = await prisma.project.upsert({
    where: { id: "proj_dev_portal" },

    update: {},

    create: {
      id: "proj_dev_portal",

      name: "Developer Portal",

      description: "Public developer portal and API docs",

      organizationId: organization.id,
    },
  });

  console.log("✓ Project:", project.name);


  // 4. Production API key — store ONLY the hash
  const demoRawKey = "sk_live_demo_seed_key_do_not_use_in_production";

  const apiKey = await prisma.apiKey.upsert({
    where: { keyHash: hashApiKey(demoRawKey) },

    update: {},

    create: {
      name: "Production",

      keyHash: hashApiKey(demoRawKey),

      projectId: project.id,

      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });

  console.log("✓ API key:", apiKey.name, "(hashed)");


  // 5. Initial audit log
  await prisma.auditLog.create({
    data: {
      action: "SEED_DATA_CREATED",

      userId: admin.id,

      projectId: project.id,

      metadata: {
        note: "Initial dataset created by prisma/seed.ts",

        seed: true,
      },
    },
  });

  console.log("✓ Audit log: SEED_DATA_CREATED\n");

  console.log("Seed complete 🎉\n");

  console.log("Login credentials (demo only):");

  console.log("  email:    admin@3278media.com");

  console.log("  password: AdminPassword123!\n");
}


main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);

    await prisma.$disconnect();

    process.exit(1);
  });