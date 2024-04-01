FROM oven/bun:1.0.25 AS builder

COPY . /wfd

ENV NODE_ENV=production

WORKDIR /wfd/workflow-man
RUN bun install
RUN bun run build

FROM node:20-slim AS runtime

WORKDIR /workflow-man
COPY --from=builder /wfd/workflow-man/build .

EXPOSE 8081

ENTRYPOINT ["node", "index.js" ]