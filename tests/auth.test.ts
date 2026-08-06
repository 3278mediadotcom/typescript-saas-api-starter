import { beforeEach, describe, expect, it, vi } from "vitest";

import request from "supertest";

import type { User } from "../src/generated/prisma/client";


// ---------------------------------------------------------------
// Mock the repository layer so tests exercise the real HTTP flow
// (routes → controllers → services) without a live database.
// ---------------------------------------------------------------
vi.mock("../src/repositories/user.repository", () => ({
  userRepository: {
    findById: vi.fn(),

    findByEmail: vi.fn(),

    create: vi.fn(),

    update: vi.fn(),

    delete: vi.fn(),
  },
}));


vi.mock("../src/repositories/auditLog.repository", () => ({
  auditLogRepository: {
    create: vi.fn(),

    findAll: vi.fn(),

    findById: vi.fn(),

    findByProjectId: vi.fn(),

    findByUserId: vi.fn(),
  },
}));


vi.mock("../src/repositories/organization.repository", () => ({
  organizationRepository: {
    findById: vi.fn(),

    findByOwnerId: vi.fn(),

    create: vi.fn(),

    update: vi.fn(),

    delete: vi.fn(),
  },
}));


import { userRepository } from "../src/repositories/user.repository";

import { auditLogRepository } from "../src/repositories/auditLog.repository";

import { organizationRepository } from "../src/repositories/organization.repository";

import { app } from "../src/app";

import { hashPassword } from "../src/utils/password";

import { signToken } from "../src/utils/jwt";


function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user_123",

    email: "test@example.com",

    passwordHash: "not-a-real-hash",

    role: "USER",

    createdAt: new Date(),

    updatedAt: new Date(),

    ...overrides,
  } as User;
}


describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/auth/register", () => {
    it("registers a new user and returns a JWT", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null);

      vi.mocked(userRepository.create).mockResolvedValueOnce(
        makeUser({ email: "new@example.com" })
      );

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "new@example.com", password: "password123" });

      expect(res.status).toBe(201);

      expect(res.body.token).toBeDefined();

      expect(res.body.user.email).toBe("new@example.com");

      expect(res.body.user.passwordHash).toBeUndefined();

      expect(auditLogRepository.create).toHaveBeenCalled();
    });

    it("rejects a duplicate email with EMAIL_TAKEN", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(makeUser());

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(409);

      expect(res.body.error.code).toBe("EMAIL_TAKEN");

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("rejects invalid payloads with INVALID_PAYLOAD", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "not-an-email", password: "short" });

      expect(res.status).toBe(400);

      expect(res.body.error.code).toBe("INVALID_PAYLOAD");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("logs in with valid credentials and returns a JWT", async () => {
      const passwordHash = await hashPassword("password123");

      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(
        makeUser({ passwordHash })
      );

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(res.status).toBe(200);

      expect(res.body.token).toBeDefined();

      expect(res.body.user.email).toBe("test@example.com");

      expect(auditLogRepository.create).toHaveBeenCalled();
    });

    it("rejects wrong password with a generic error", async () => {
      const passwordHash = await hashPassword("correct-password");

      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(
        makeUser({ passwordHash })
      );

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test@example.com", password: "wrong-password" });

      expect(res.status).toBe(401);

      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("rejects unknown email with the same generic error", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nobody@example.com", password: "password123" });

      expect(res.status).toBe(401);

      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("Protected routes", () => {
    it("returns 401 when no token is provided", async () => {
      const res = await request(app).get("/api/v1/users/me");

      expect(res.status).toBe(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 401 for an invalid token", async () => {
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", "Bearer not.a.real.token");

      expect(res.status).toBe(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 401 for a malformed Authorization header", async () => {
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", "Basic abc123");

      expect(res.status).toBe(401);

      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("lets an authenticated user access /users/me", async () => {
      const user = makeUser();

      // authenticate() and getProfile() both call findById
      vi.mocked(userRepository.findById).mockResolvedValue(user);

      const token = signToken({ sub: user.id, role: user.role });

      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      expect(res.body.user.email).toBe("test@example.com");
    });

    it("lets an authenticated user create an organization", async () => {
      const user = makeUser();

      const organization = {
        id: "org_1",

        name: "Acme Corp",

        ownerId: user.id,

        createdAt: new Date(),

        updatedAt: new Date(),
      };

      // authenticate middleware loads the user
      vi.mocked(userRepository.findById).mockResolvedValueOnce(user);

      // organizationService verifies the owner exists
      vi.mocked(userRepository.findById).mockResolvedValueOnce(user);

      vi.mocked(organizationRepository.create).mockResolvedValueOnce(
        organization as never
      );

      const token = signToken({ sub: user.id, role: user.role });

      const res = await request(app)
        .post("/api/v1/organizations")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Acme Corp" });

      expect(res.status).toBe(201);

      expect(res.body.organization.name).toBe("Acme Corp");
    });
  });

  describe("Admin-only routes", () => {
    it("returns 403 when a USER accesses admin routes", async () => {
      const user = makeUser();

      vi.mocked(userRepository.findById).mockResolvedValueOnce(user);

      const token = signToken({ sub: user.id, role: "USER" });

      const res = await request(app)
        .get("/api/v1/audit-logs")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);

      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("returns 403 when a USER tries to delete a user", async () => {
      const user = makeUser();

      vi.mocked(userRepository.findById).mockResolvedValueOnce(user);

      const token = signToken({ sub: user.id, role: "USER" });

      const res = await request(app)
        .delete("/api/v1/users/user_456")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);

      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("lets an ADMIN access audit logs", async () => {
      const admin = makeUser({ role: "ADMIN" });

      vi.mocked(userRepository.findById).mockResolvedValueOnce(admin);

      vi.mocked(auditLogRepository.findAll).mockResolvedValueOnce([]);

      const token = signToken({ sub: admin.id, role: "ADMIN" });

      const res = await request(app)
        .get("/api/v1/audit-logs")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      expect(res.body.auditLogs).toEqual([]);
    });

    it("lets an ADMIN delete a user", async () => {
      const admin = makeUser({ role: "ADMIN" });

      vi.mocked(userRepository.findById).mockResolvedValueOnce(admin);

      vi.mocked(userRepository.findById).mockResolvedValueOnce(makeUser());

      vi.mocked(userRepository.delete).mockResolvedValueOnce(makeUser());

      const token = signToken({ sub: admin.id, role: "ADMIN" });

      const res = await request(app)
        .delete("/api/v1/users/user_456")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);

      expect(userRepository.delete).toHaveBeenCalledWith("user_456");
    });
  });
});