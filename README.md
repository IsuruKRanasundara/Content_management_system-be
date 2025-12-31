# Content Management System (CMS)

A full-stack CMS built with **.NET 9** (C#) for the backend and **React + TypeScript** for the frontend. The stack is containerized with **Docker**, uses **MongoDB** for persistence, and **RabbitMQ** for messaging.

> Update any placeholder values (✅) to match the exact commands, paths, and environment variables used in this repo.

---

## Features (high level)
- Modular CMS backend on .NET 9 (REST APIs, validation, logging, DI).
- React + TypeScript SPA frontend.
- MongoDB for content storage.
- RabbitMQ for async workflows / background jobs.
- Dockerized services (backend, frontend, MongoDB, RabbitMQ).
- Ready for local dev and containerized deployments.

---

## Tech stack
- **Backend:** .NET 9, C#
- **Frontend:** React, TypeScript, CSS
- **Messaging:** RabbitMQ
- **Database:** MongoDB
- **Tooling:** Docker, Docker Compose, Shell/Batch/Makefile helpers (if present)

---

## Repository layout (adjust to actual paths)
- `src/backend/` ✅ .NET 9 API
- `src/frontend/` ✅ React app
- `docker-compose.yml` ✅ Multi-service orchestration
- `Makefile` / `scripts/` ✅ Dev helpers (optional)
- `docs/` ✅ Additional documentation (optional)

---

## Prerequisites
- .NET 9 SDK
- Node.js 20+ and npm (or pnpm/yarn) for the frontend
- Docker & Docker Compose
- MongoDB and RabbitMQ (bundled via Docker Compose)

---

## Environment variables
Create a `.env` (or `.env.local`) at the repo root for Docker Compose and local runs. Adjust keys to match your actual app settings.

```
# Backend
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://+:5000
MONGODB_CONNECTION_STRING=mongodb://mongo:27017/cms
MONGODB_DATABASE=cms
RABBITMQ_HOST=rabbitmq
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
JWT__ISSUER=your-issuer
JWT__AUDIENCE=your-audience
JWT__KEY=your-signing-key

# Frontend
VITE_API_BASE_URL=http://localhost:5000
```

If running backend without Docker, point Mongo/RabbitMQ to your local instances (e.g., `mongodb://localhost:27017` and `localhost` for RabbitMQ).

---

## Running locally (without Docker)
Backend:
```bash
cd src/backend      # ✅ update path if different
dotnet restore
dotnet build
dotnet test         # optional
dotnet run
```

Frontend:
```bash
cd src/frontend     # ✅ update path if different
npm install         # or pnpm/yarn
npm run dev         # or npm start, adjust as needed
```

---

## Running with Docker Compose
```bash
docker compose pull        # optional, if images are published
docker compose build       # builds backend/frontend images
docker compose up -d       # starts backend, frontend, mongo, rabbitmq
docker compose logs -f     # follow logs
```

- Backend: http://localhost:5000 ✅
- Frontend: http://localhost:5173 ✅ (or the port exposed in compose)
- MongoDB: mapped to localhost:27017 (if exposed)
- RabbitMQ: management UI on http://localhost:15672 (if enabled)

---

## Deployment (example)
- Build & push images:
  ```bash
  docker build -t your-registry/cms-backend:TAG -f src/backend/Dockerfile .
  docker build -t your-registry/cms-frontend:TAG -f src/frontend/Dockerfile .
  docker push your-registry/cms-backend:TAG
  docker push your-registry/cms-frontend:TAG
  ```
- Deploy via your orchestrator (Kubernetes, ECS, etc.) with MongoDB and RabbitMQ configured as managed services or Helm charts.

---

## Testing
- Backend: `dotnet test` (add solution/test project path if needed).
- Frontend: `npm test` / `npm run test:unit` ✅ if configured.
- End-to-end: describe Playwright/Cypress flow here ✅ if available.

---

## API docs
- If using Swagger: visit `http://localhost:5000/swagger` ✅
- Otherwise link to `docs/api.md` or OpenAPI JSON if present.

---

## Troubleshooting
- **Ports in use:** stop other services or change exposed ports in `docker-compose.yml`.
- **Mongo/RabbitMQ connection issues:** verify container health, credentials, and host names (`mongo`, `rabbitmq`).
- **CORS/API base URL:** ensure `VITE_API_BASE_URL` matches the backend URL.

---

## Contributing
1) Fork & clone the repo  
2) Create a branch: `git checkout -b feature/my-change`  
3) Commit with context: `git commit -m "Add ..."`  
4) Push and open a PR

---

## License
Add the project’s license here (e.g., MIT) ✅
