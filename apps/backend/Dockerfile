# Base stage for dependencies
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g turbo

# Dependency stage
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/package.json
# Add other apps/packages package.json if needed to resolve monorepo deps
# In this case, backend seems independent but just to be safe for Turbo
RUN npm ci

# Builder stage
FROM base AS builder
COPY . .
RUN npm ci
RUN npm run build -- --filter=backend

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./package.json

USER nestjs

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "dist/main"]
