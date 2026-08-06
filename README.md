# TypeScript SaaS API Starter

Production-style TypeScript SaaS backend starter demonstrating authentication, authorization, database architecture, and scalable API patterns.

## Overview

<!-- TODO: Describe what this project demonstrates and who it is for -->

## Features

<!-- TODO: List key features as they are built -->

- Coming soon

## Architecture

<!-- TODO: Add architecture diagram once database and auth are designed -->

## Tech Stack

- **TypeScript** — type safety end-to-end
- **Express** — HTTP framework
- **Prisma** — database ORM
- **PostgreSQL** — relational database
- **Zod** — runtime validation
- **JWT** — authentication
- **bcrypt** — password hashing
- **Helmet / CORS** — security middleware
- **Vitest + Supertest** — testing

## Project Structure

```
src/
├── app.ts                # Express app factory
├── server.ts             # Entry point + graceful shutdown
├── config/               # Environment configuration
├── controllers/          # HTTP request/response handling
├── database/             # Prisma client singleton
├── middleware/           # Auth, authorization, error handling
├── repositories/         # Database queries
├── routes/               # Versioned API routes
├── schemas/              # Zod validation schemas
├── services/             # Business logic
├── types/                # Shared types
└── utils/                # AppError, logger, etc.
```

## API Documentation

<!-- TODO: Document each endpoint as it is built -->

### `GET /api/v1/health`

Health check for load balancers and monitoring.

## Database Design

Multi-tenant SaaS data model:

```
User
 │
 ├── owns Organization(s)
 │        └── contains Project(s)
 │                 ├── has ApiKey(s)
 │                 └── has AuditLog(s)
 └── has AuditLog(s)
```

| Model | Purpose |
|---|---|
| `User` | Auth credential + role (`USER` / `ADMIN`) |
| `Organization` | Multi-tenant boundary; owns resources |
| `Project` | A scoped unit of work inside an organization |
| `ApiKey` | Hashed API key for programmatic access |
| `AuditLog` | Immutable record of security + business actions |

Security: only **hashed** API keys (`sk_live_...` → SHA-256) are stored, same principle as passwords.

## Authentication Flow

<!-- TODO: Document register / login / JWT refresh flow -->
Register and login flows are built on the `userService`, then protected routes use JWT middleware.

## Security Features

<!-- TODO: List security measures as they are built -->

- Helmet security headers
- CORS whitelisting
- Structured error responses (no stack traces leaked)

## Running Locally

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Then edit `.env` with your database URL and JWT secret.

### Database Setup

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations (needs DATABASE_URL)
npm run db:seed       # Seed demo data (admin@3278media.com)
npm run db:studio     # Visual database inspector
```

### Run in Development

```bash
npm run dev
```

Server starts at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Testing

```bash
npm test