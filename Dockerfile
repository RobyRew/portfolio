# syntax=docker/dockerfile:1.10
# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: build (Node only at build time) — Node 22 LTS
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# 1. Install build tools just in case, but REMOVE vips-dev.
# Keeping vips-dev forces sharp to compile from source. We don't want that.
RUN apk add --no-cache --virtual .build-deps libc6-compat python3 make g++

COPY package.json package-lock.json* ./

# 2. Force sharp to use its own pre-compiled binaries and ignore any global vips
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV npm_config_arch=x64
ENV npm_config_platform=linux
ENV npm_config_libc=musl

# 3. Install dependencies WITHOUT the lockfile first to ensure it grabs the Linux binaries
# instead of trying to replicate your local Windows/Mac environment.
RUN npm install --no-audit --no-fund --no-package-lock

# 4. Once node_modules is happy, copy the rest of your code
COPY . .

# 5. Build the project
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: serve — unprivileged nginx (no Node at runtime, no root)
# ─────────────────────────────────────────────────────────────────────────────
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

# nginx-unprivileged runs as UID 101 (`nginx`) by default — root only for setup
USER root
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/robots.txt || exit 1

CMD ["nginx", "-g", "daemon off;"]