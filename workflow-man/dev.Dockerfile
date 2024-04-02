FROM node:20-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /wfd
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter "workflow-man..." install --frozen-lockfile
RUN pnpm i -g bun
ENV NODE_ENV=development
RUN pnpm --filter "workflow-man" run build

FROM node:20-slim AS runtime
WORKDIR /workflow-man
COPY --from=build /wfd/workflow-man/build .
EXPOSE 8081
ENTRYPOINT ["node", "index.js" ]


# oven/bun kept hanging on install, so we're gonna use pnpm for 
# everything and just use bun as the bundler.