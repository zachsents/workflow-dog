FROM oven/bun AS builder

WORKDIR /wfd
COPY . .

ENV NODE_ENV=production

RUN bun install --cwd workflow-man
RUN bun run --cwd workflow-man build

FROM oven/bun AS runtime

WORKDIR /workflow-man
COPY --from=builder /wfd/workflow-man/build .

EXPOSE 8081

ENTRYPOINT ["bun", "run", "index.js" ]