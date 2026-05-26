# syntax=docker/dockerfile:1.10
# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: build (Node only at build time) — Node 22 LTS
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# ADDED: python3, make, and g++ (required by node-gyp to build sharp)
RUN apk add --no-cache --virtual .build-deps libc6-compat python3 make g++ \
 && apk add --no-cache vips-dev

COPY package.json package-lock.json* ./

# ADDED: --platform=linux --libc=musl to force npm to grab the correct sharp pre-build for Alpine
RUN npm install --no-audit --no-fund --legacy-peer-deps --prefer-offline --platform=linux --libc=musl

COPY . .
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
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/en/ || exit 1

CMD ["nginx", "-g", "daemon off;"]