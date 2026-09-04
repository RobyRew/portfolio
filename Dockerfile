# syntax=docker/dockerfile:1.10
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache --virtual .build-deps libc6-compat python3 make g++
COPY package.json package-lock.json* ./
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV npm_config_arch=x64
ENV npm_config_platform=linux
ENV npm_config_libc=musl
RUN npm install --no-audit --no-fund --no-package-lock
COPY . .
RUN npm run build

# Shared runtime, replacing 127 lines of nginx config that duplicated
# kingdomskids' almost exactly. See RobyRew/platform.
FROM ghcr.io/robyrew/static-web:1
# Astro emits extensionless URLs, so /about must resolve to /about/index.html.
# $uri is escaped: Docker substitutes variables in ENV, and an undefined $uri
# would become an empty string, leaving try_files "/index.html .html =404".
# nginx must receive the literal $uri.
ENV WEB_FALLBACK="\$uri/index.html \$uri.html =404"
ENV CSP_SCRIPT_EXTRA="https://stats.cosmincalin.es" \
    CSP_CONNECT_EXTRA="https://stats.cosmincalin.es"
COPY --chown=nginx:nginx nginx/app.d/ /etc/nginx/robyrew/app.d/
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
