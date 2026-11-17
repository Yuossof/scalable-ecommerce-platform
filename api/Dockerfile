
FROM node:26.13.1-alpine AS base

WORKDIR /app

# Install all dependencies
FROM base AS deps

COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Install production dependencies only
FROM base AS prod-deps

COPY package*.json ./
RUN npm ci --omit=dev

# Production image
FROM base AS runner

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/proto ./proto

EXPOSE 8090

CMD ["sh", "-c", "npm run db:migrate && npm start"]
