
# Define base
FROM node:18-alpine AS base

# Prepare workspace
FROM base AS workspace
  WORKDIR /app

  RUN apk add --no-cache libc6-compat
  RUN apk update
  RUN npm install pnpm@8.3.1 turbo --global
  RUN pnpm config set store-dir ~/.pnpm-store

  COPY pnpm-lock.yaml .
  RUN pnpm fetch

  COPY . .
  RUN pnpm install --frozen-lockfile

# Create minimal deployment for given package
FROM workspace AS pruned
  WORKDIR /app

  RUN pnpm build --filter=api
  RUN pnpm deploy --filter=api --prod pruned

# Production image
FROM base
  WORKDIR /app

  RUN mkdir -p ./data/logs
  COPY --from=pruned /app/pruned/dist/ dist
  COPY --from=pruned /app/pruned/node_modules/ node_modules
  COPY --from=pruned /app/pruned/package.json ./

  ENTRYPOINT ["node", "dist/index.js"]
