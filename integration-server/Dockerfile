FROM oven/bun AS builder

WORKDIR /wfd
COPY . .

ENV NODE_ENV=production

RUN bun install --cwd integration-server
RUN bun run --cwd integration-server build

FROM oven/bun AS runtime

WORKDIR /integration-server
COPY --from=builder /wfd/integration-server/build .

EXPOSE 8080

ENTRYPOINT ["bun", "run", "index.js" ]