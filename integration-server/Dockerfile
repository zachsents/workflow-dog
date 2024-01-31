FROM oven/bun

WORKDIR /wfd
COPY . .
RUN npm i -g pnpm
RUN pnpm --filter api-server -P install

EXPOSE 443

ENTRYPOINT [ "pnpm", "--filter", "api-server", "start" ]