
# --- Build --- 

FROM node:20-slim AS build

# pnpm setup -- copied from pnpm docs
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy entire monorepo so workspace dependencies are available
WORKDIR /wfd
COPY . .

# Crazy install command, adapted from pnpm docs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter "web..." install --frozen-lockfile
ENV NODE_ENV=production
RUN pnpm --filter "web" run build


# --- Run --- 

FROM node:20-slim AS runtime
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=build --chown=nextjs:nodejs /wfd/web/.next/standalone ./

# Set the correct permission for prerender cache
RUN chown nextjs:nodejs web/.next

COPY --from=build --chown=nextjs:nodejs /wfd/web/.next/static ./web/.next/static
COPY --from=build /wfd/web/public ./web/public

USER nextjs

EXPOSE 3000
ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node web/server.js