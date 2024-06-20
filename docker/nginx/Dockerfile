FROM node:18 as build

WORKDIR /app/landing
COPY ./landing ./
RUN npm i -g pnpm
RUN pnpm install
RUN pnpm run build
# resulting build is in /app/public

# generate htpasswd
WORKDIR /app
ARG HTUSER
ARG HTPASS
RUN apt-get update && apt-get install -y apache2-utils
RUN htpasswd -c -b ./.htpasswd "${HTUSER}" "${HTPASS}"

# ---
FROM nginx:latest as production

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/.htpasswd /etc/nginx/.htpasswd

COPY --from=build /app/landing/public /www/home