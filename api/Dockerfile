FROM node:26.13.1-alpine as base

WORKDIR /app

FROM base as deps

COPY package*.json ./
RUN npm ci --omit=dev

FROM deps as builder

COPY . .
RUN npm run build

FROM base as prod-deps

COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS runner

ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/proto ./proto

EXPOSE 8090

CMD ["sh", "-c", "npm run db:migrate && npm start"]
