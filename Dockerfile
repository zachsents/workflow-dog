FROM oven/bun AS base-build
WORKDIR /app/full
COPY . .
RUN sh ./scripts/make_skeleton.sh ../base && rm -rf /app/full

FROM oven/bun AS base
WORKDIR /app
COPY --from=base-build /app/base ./
RUN bun install


# Marketing site ----------------------------------------- #

FROM base AS marketing-site-build
COPY ./services/marketing-site ./services/marketing-site
RUN bun --filter marketing-site build dist

FROM nginx AS marketing-site-prod
COPY ./services/marketing-site/nginx.conf /etc/nginx/
COPY --from=marketing-site-build /app/services/marketing-site/dist /www

FROM base AS marketing-site-dev
RUN apt update && apt install -y nginx
COPY ./services/marketing-site/nginx.conf /etc/nginx/nginx.conf
WORKDIR /app/services/marketing-site
CMD bun run dev-in-container & nginx -g "daemon off;"

# Web app ------------------------------------------------ #

FROM base AS web-build
COPY ./packages ./packages
COPY ./services ./services
RUN bun --filter web build

FROM nginx AS web-prod
COPY ./services/web/nginx.conf /etc/nginx/
COPY --from=web-build /app/services/web/dist /www


# Proxy -------------------------------------------------- #

FROM caddy AS proxy
COPY ./services/proxy/Caddyfile /etc/caddy/


# API ---------------------------------------------------- #

FROM base AS api
RUN apt-get update && apt-get install -y ruby-full
RUN gem install premailer nokogiri
COPY ./packages ./packages
COPY ./services/api /app/services/api
WORKDIR /app/services/api
CMD bun .


# Database ----------------------------------------------- #

FROM postgres AS db
RUN apt-get update && apt-get install -y curl unzip
USER postgres
RUN curl -fsSL https://bun.sh/install | bash
WORKDIR /wfd/db
COPY ./services/db .
RUN ~/.bun/bin/bun install
WORKDIR /
COPY ./services/db/startup.sh /docker-entrypoint-initdb.d/
USER root
RUN chmod a+x /docker-entrypoint-initdb.d/startup.sh