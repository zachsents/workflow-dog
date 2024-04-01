FROM oven/bun:latest AS builder

COPY . /wfd

ENV NODE_ENV=production

WORKDIR /wfd/workflow-man
RUN bun install --frozen-lockfile
RUN bun run build

FROM node:20-slim AS runtime

WORKDIR /workflow-man
COPY --from=builder /wfd/workflow-man/build .

EXPOSE 8081

ENTRYPOINT ["node", "index.js" ]