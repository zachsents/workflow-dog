FROM oven/bun:1.0.25 AS builder

WORKDIR /wfd
COPY . .

ENV NODE_ENV=production

RUN bun install --cwd workflow-man
RUN bun run --cwd workflow-man build

FROM node:20-slim AS runtime

WORKDIR /workflow-man
COPY --from=builder /wfd/workflow-man/build .

EXPOSE 8081

ENTRYPOINT ["node", "index.js" ]