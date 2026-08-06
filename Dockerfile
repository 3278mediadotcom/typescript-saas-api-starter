# ---- Base ----
FROM node:22-alpine AS base

WORKDIR /app

# ---- Dependencies ----
FROM base AS deps

COPY package*.json ./

RUN npm ci

# ---- Build ----
FROM base AS build

# Required for `prisma generate` in Prisma 7 (env is resolved from prisma.config.ts)
ARG DATABASE_URL

ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Generate Prisma client + compile TypeScript
RUN npx prisma generate \
    && npm run build

# Prune dev dependencies for the runtime image
RUN npm prune --omit=dev

# ---- Runtime ----
FROM base AS runtime

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json

# prisma CLI + tsx are needed for db:migrate / db:seed inside the container
RUN npm install -g prisma@7.9.1 tsx@4.23.8

EXPOSE 3000

CMD ["node", "dist/server.js"]
