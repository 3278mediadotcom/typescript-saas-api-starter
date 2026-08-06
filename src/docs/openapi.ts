/**
 * OpenAPI 3.1 specification for the SaaS API.
 *
 * Served interactively at /api/v1/docs via swagger-ui-express.
 * Keep in sync with the route definitions in src/routes.
 */
export const openApiSpec = {
  openapi: "3.1.0",

  info: {
    title: "TypeScript SaaS API Starter",

    version: "1.0.0",

    description:
      "Production-style TypeScript SaaS backend demonstrating authentication, " +
      "authorization, multi-tenant data modeling, and audit logging.",
  },

  servers: [
    {
      url: "/api/v1",

      description: "API v1",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",

        scheme: "bearer",

        bearerFormat: "JWT",
      },
    },

    schemas: {
      RegisterInput: {
        type: "object",

        required: ["email", "password"],

        properties: {
          email: { type: "string", format: "email" },

          password: { type: "string", minLength: 8 },
        },
      },

      LoginInput: {
        type: "object",

        required: ["email", "password"],

        properties: {
          email: { type: "string", format: "email" },

          password: { type: "string" },
        },
      },

      AuthResponse: {
        type: "object",

        properties: {
          token: { type: "string" },

          user: { $ref: "#/components/schemas/SafeUser" },
        },
      },

      SafeUser: {
        type: "object",

        properties: {
          id: { type: "string" },

          email: { type: "string" },

          role: { type: "string", enum: ["USER", "ADMIN"] },

          createdAt: { type: "string", format: "date-time" },

          updatedAt: { type: "string", format: "date-time" },
        },
      },

      CreateOrganizationInput: {
        type: "object",

        required: ["name"],

        properties: {
          name: { type: "string", minLength: 1 },
        },
      },

      Organization: {
        type: "object",

        properties: {
          id: { type: "string" },

          name: { type: "string" },

          ownerId: { type: "string" },

          createdAt: { type: "string", format: "date-time" },

          updatedAt: { type: "string", format: "date-time" },
        },
      },

      AuditLog: {
        type: "object",

        properties: {
          id: { type: "string" },

          action: { type: "string" },

          userId: { type: "string" },

          projectId: { type: "string", nullable: true },

          metadata: { type: "object", nullable: true },

          createdAt: { type: "string", format: "date-time" },
        },
      },

      ErrorResponse: {
        type: "object",

        properties: {
          success: { type: "boolean", const: false },

          error: {
            type: "object",

            properties: {
              code: { type: "string" },

              message: { type: "string" },
            },
          },
        },
      },
    },
  },

  paths: {
    "/health": {
      get: {
        summary: "Health check",

        tags: ["System"],

        responses: {
          200: {
            description: "Service is healthy",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    status: { type: "string" },

                    service: { type: "string" },

                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/auth/register": {
      post: {
        summary: "Register a new user",

        tags: ["Auth"],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },

        responses: {
          201: {
            description: "User created; JWT issued",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },

          400: {
            description: "Invalid payload",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },

          409: {
            description: "Email already taken",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/auth/login": {
      post: {
        summary: "Login and receive a JWT",

        tags: ["Auth"],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },

        responses: {
          200: {
            description: "Login successful; JWT issued",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },

          401: {
            description: "Invalid credentials",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/auth/me": {
      get: {
        summary: "Get the current authenticated user",

        tags: ["Auth"],

        security: [{ bearerAuth: [] }],

        responses: {
          200: {
            description: "Current user",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    user: { $ref: "#/components/schemas/SafeUser" },
                  },
                },
              },
            },
          },

          401: {
            description: "Missing or invalid token",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/users/me": {
      get: {
        summary: "Get the current user's profile",

        tags: ["Users"],

        security: [{ bearerAuth: [] }],

        responses: {
          200: {
            description: "Current user profile",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    user: { $ref: "#/components/schemas/SafeUser" },
                  },
                },
              },
            },
          },

          401: {
            description: "Unauthorized",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/users/{id}": {
      delete: {
        summary: "Delete a user (admin only)",

        tags: ["Users"],

        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "id",

            in: "path",

            required: true,

            schema: { type: "string" },
          },
        ],

        responses: {
          204: {
            description: "User deleted",
          },

          401: {
            description: "Unauthorized",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },

          403: {
            description: "Forbidden (requires ADMIN)",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },

          404: {
            description: "User not found",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/organizations": {
      post: {
        summary: "Create an organization",

        tags: ["Organizations"],

        security: [{ bearerAuth: [] }],

        requestBody: {
          required: true,

          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrganizationInput" },
            },
          },
        },

        responses: {
          201: {
            description: "Organization created",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    organization: {
                      $ref: "#/components/schemas/Organization",
                    },
                  },
                },
              },
            },
          },

          401: {
            description: "Unauthorized",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },

      get: {
        summary: "List organizations owned by the current user",

        tags: ["Organizations"],

        security: [{ bearerAuth: [] }],

        responses: {
          200: {
            description: "Organizations list",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    organizations: {
                      type: "array",

                      items: {
                        $ref: "#/components/schemas/Organization",
                      },
                    },
                  },
                },
              },
            },
          },

          401: {
            description: "Unauthorized",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/audit-logs": {
      get: {
        summary: "List audit logs (admin only)",

        tags: ["Audit"],

        security: [{ bearerAuth: [] }],

        parameters: [
          {
            name: "userId",

            in: "query",

            required: false,

            schema: { type: "string" },
          },

          {
            name: "projectId",

            in: "query",

            required: false,

            schema: { type: "string" },
          },
        ],

        responses: {
          200: {
            description: "Audit logs list",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    auditLogs: {
                      type: "array",

                      items: { $ref: "#/components/schemas/AuditLog" },
                    },
                  },
                },
              },
            },
          },

          401: {
            description: "Unauthorized",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },

          403: {
            description: "Forbidden (requires ADMIN)",

            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};