# Builder
FROM oven/bun:alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY frontend/package.json frontend/bun.lock frontend/bunfig.toml ./
RUN bun install --frozen-lockfile

ARG NEXT_PUBLIC_BROWSER_API_URL
ENV NEXT_PUBLIC_BROWSER_API_URL=${NEXT_PUBLIC_BROWSER_API_URL}

COPY frontend .

RUN bun run lint
RUN bun run build

# Runtime
FROM oven/bun:alpine
WORKDIR /app

RUN apk add --no-cache varnish \
    && addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public

COPY frontend/default.vcl /etc/varnish/default.vcl
COPY frontend/entrypoint.sh ./entrypoint.sh

RUN chown app:app /etc/varnish \
    && chown app:app /var/lib/varnish \
    && chmod +x ./entrypoint.sh

USER app

EXPOSE 3000

CMD ["/bin/sh", "/app/entrypoint.sh"]
