FROM oven/bun

WORKDIR /realtime
COPY . .

RUN bun install

ENTRYPOINT [ "bun", "index.ts" ]