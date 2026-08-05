import "dotenv/config";


/**
 * Centralized environment configuration.
 *
 * All environment variables are validated and typed
 * at startup so misconfiguration fails fast.
 */
function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}


export const config = {
  server: {
    port: Number(process.env.PORT ?? 3000),

    nodeEnv: process.env.NODE_ENV ?? "development",
  },

  database: {
    url: requireEnv("DATABASE_URL"),
  },

  auth: {
    jwtSecret: requireEnv("JWT_SECRET"),

    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  },

  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3001",
  },
};