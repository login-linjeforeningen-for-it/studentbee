# Uses latest bun alpine image for apk package manager
FROM oven/bun:alpine

# Sets the working directory
WORKDIR /usr/src/app

# Copies package.json and package-lock.json to the Docker environment
COPY package.json bun.lock bunfig.toml ./

# Installs required dependencies
RUN bun install --frozen-lockfile

# Copies contents
COPY . .

# Starts the application
CMD bun src/index.ts
