FROM oven/bun AS builder

WORKDIR /wfd
COPY . .

ENV NODE_ENV=production

RUN bun install --cwd api-server
RUN bun run --cwd api-server build

FROM oven/bun AS runtime

WORKDIR /api-server
COPY --from=builder /wfd/api-server/build .

EXPOSE 8080

ENTRYPOINT ["bun", "run", "index.js" ]