FROM oven/bun as base-build
WORKDIR /app/full
COPY . .
RUN sh ./scripts/make_skeleton.sh ../base && rm -rf /app/full

FROM oven/bun as base
WORKDIR /app
COPY --from=base-build /app/base ./
RUN bun install


# Web app ------------------------------------------------ #

FROM base as web-build
ARG APP_ORIGIN
ENV VITE_APP_ORIGIN=${APP_ORIGIN}
COPY ./packages/core /app/packages/core
COPY ./packages/workflow-packages /app/packages/workflow-packages
COPY ./services/api /app/services/api
COPY ./services/web /app/services/web
WORKDIR /app/services/web
RUN bun run build

FROM nginx as web-prod
COPY ./services/web/nginx.conf /etc/nginx/
COPY --from=web-build /app/services/web/dist /www


# Proxy + landing page ----------------------------------- #

FROM base as landing-build
COPY ./services/landing /app/services/landing
RUN bun run --filter landing build

# Old proxy -- not using
# FROM nginx as proxy
# ARG HTUSER
# ARG HTPASS
# RUN apt-get update && apt-get install -y apache2-utils && rm -rf /var/lib/apt/lists/*
# RUN htpasswd -c -b /etc/nginx/.htpasswd "${HTUSER}" "${HTPASS}"
# COPY ./services/proxy/nginx.conf /etc/nginx/
# COPY --from=landing-build /app/services/landing/dist /www

FROM caddy as proxy
COPY ./services/proxy/Caddyfile /etc/caddy/
COPY --from=landing-build /app/services/landing/dist /www


# API ---------------------------------------------------- #

FROM base as api
RUN apt-get update && apt-get install -y ruby-full
RUN gem install premailer nokogiri
COPY ./packages/core /app/packages/core
COPY ./packages/email-templates /app/packages/email-templates
COPY ./services/api /app/services/api
WORKDIR /app/services/api
CMD ["bun", "."]


# Database ----------------------------------------------- #

FROM postgres as db
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