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

<!-- TODO: Document User / Organization / Project / ApiKey / AuditLog schema -->

## Authentication Flow

<!-- TODO: Document register / login / JWT refresh flow -->

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