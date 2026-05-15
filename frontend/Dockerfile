# Latest bun base image
FROM oven/bun:alpine

# Installs dependencies
RUN apk add --no-cache python3 make g++ varnish

# Container working directory
WORKDIR /app

# Starts varnish
COPY frontend/default.vcl /etc/varnish/default.vcl

# Copies entrypoint
COPY frontend/entrypoint.sh ./entrypoint.sh

# Copies package versions
COPY frontend/package.json frontend/bun.lock frontend/bunfig.toml ./

# Installs dependencies
RUN bun install --frozen-lockfile

# Copies source code
COPY frontend .
COPY .env .env

# Builds the application
RUN bun run build

# Exposes port 3000
EXPOSE 3000

# Starts the application
CMD ["/bin/sh", "/app/entrypoint.sh"]
