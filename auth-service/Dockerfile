FROM node:18-alpine AS base
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# Install turbo globally
RUN yarn global add turbo@^2.7.2 pnpm@latest

# ---
FROM base AS pruner
COPY . .
# Prune the monorepo for auth-service (this includes shared packages it depends on)
RUN turbo prune auth-service --docker

# ---
FROM base AS installer
# Copy lockfile and package.json files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY --from=pruner /app/out/full/ .

# Build if needed (only if you have a build step)
# RUN pnpm turbo build --filter=auth-service

# ---
FROM base AS runner
WORKDIR /app

# Copy node_modules and source from installer
COPY --from=installer /app .

# Set to production (optional)
ENV NODE_ENV=development

# Expose port
EXPOSE 3000

# Start the service
WORKDIR /app/auth-service
CMD ["pnpm", "run", "dev"]