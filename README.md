<div align="center">

<img src="https://s3.login.no/beehive/img/logo/logo-white-small.svg" alt="Login logo" width="80" height="80" />

<h1>StudentBee</h1>

<p>
  <img src="https://img.shields.io/badge/TypeScript-fd8738?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Bun-fd8738?style=flat-square&logo=bun&logoColor=white" alt="Bun" />
  <img src="https://img.shields.io/badge/Next.js-fd8738?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-fd8738?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-fd8738?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Fastify-fd8738?style=flat-square&logo=fastify&logoColor=white" alt="Fastify" />
  <img src="https://img.shields.io/badge/PostgreSQL-fd8738?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-fd8738?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Authentik-fd8738?style=flat-square&logo=authentik&logoColor=white" alt="Authentik" />
</p>

</div>

---

StudentBee is an exam practice website for Login members. It provides a card-based learning experience for studying course material.

## Features

- **Log in via Authentik** (OAuth2)
- **Card-based exam practice** with full study functionality
- **Course and deck management**

## Getting Started

1. **Configure environment**

   Create a `.env` file in the repo root. See [Configuration](#configuration) below or grab the values from 1Password.

2. **Start**

   ```bash
   docker compose up --build
   ```

   | Service  | URL                    |
   |----------|------------------------|
   | Frontend | http://localhost:8400  |
   | API      | http://localhost:8401  |

## Configuration

All variables go in the root `.env` file, shared by both services.

| Name                          | Default        | Notes                                          |
|-------------------------------|----------------|------------------------------------------------|
| `AUTHENTIK_URL`               |                | Base URL for your Authentik instance           |
| `CLIENT_ID`                   |                | OAuth2 client ID from Authentik                |
| `CLIENT_SECRET`               |                | OAuth2 client secret from Authentik            |
| `API_URL`                     |                | Server-side URL to the API                     |
| `NEXT_PUBLIC_BROWSER_API_URL` |                | Client-side URL to the API                     |
| `DB`                          | `studentbee`   | Postgres database name                         |
| `DB_HOST`                     |                | Postgres host                                  |
| `DB_USER`                     | `studentbee`   | Postgres username                              |
| `DB_PASSWORD`                 |                | Postgres password                              |

## Project Structure

- `frontend/` - Next.js frontend
- `api/` - Fastify API
- `db/` - Database schema
