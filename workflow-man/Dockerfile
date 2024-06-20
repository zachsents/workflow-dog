FROM node:20-slim as build

# setup PNPM
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# copy whole monorepo for now
WORKDIR /wfd
COPY . .

# install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter "workflow-man..." install --frozen-lockfile

# build
RUN pnpm i -g bun
ENV NODE_ENV=production
RUN pnpm --filter "workflow-man" run build

# run
FROM node:20-slim AS runtime
WORKDIR /workflow-man
COPY --from=build /wfd/workflow-man/build .
ENTRYPOINT ["node", "index.js" ]

# oven/bun kept hanging on install, so we're gonna use pnpm for 
# everything and just use bun as the bundler.