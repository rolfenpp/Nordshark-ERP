# ERP monorepo

**Demo:** [https://erp-client-flame.vercel.app](https://erp-client-flame.vercel.app)

A **business system dashboard**: **backend API** (ASP.NET Core) and **web client** (React + Vite).

## Nordshark business system

The web client is a light themed **Nordshark** admin UI with left navigation, headline KPIs (invoices, revenue, users, pending amounts), a revenue trend chart, invoice status breakdown, recent activity, and top clients: typical ERP style monitoring in one view.

![Nordshark dashboard: KPIs, revenue chart, invoice status, activity, and top clients](docs/images/nordshark-dashboard.png)

## Docker (optional local stack)

You can run database services and the API with Docker Desktop using the compose file under the API project. A typical setup includes a **PostgreSQL** container (development data), an **optional pgAdmin** instance for browsing the DB, and the **API** container, all grouped under one compose project, as shown below.

![Docker Desktop: compose project with Postgres, pgAdmin, and API containers running locally](docs/images/docker-desktop-containers.png)

This is only a **local tooling** view: resource usage and port bindings are environment specific and do not reflect production. No secrets belong in screenshots; keep API keys and connection strings out of the repo (use `.env` / user secrets, never commit real credentials).

## Local development

Typical flow on your machine (ports follow `ERP-api/Properties/launchSettings.json` and `ERP-client` config):

1. **PostgreSQL** — From `ERP-api`, start the dev database, e.g. `docker compose -f docker-compose.dev.yml up -d db`. Use the host port and database name from that compose file (and match `ConnectionStrings:DefaultConnection` in `appsettings.Development.json` or override with the `ConnectionStrings__DefaultConnection` environment variable).
2. **API** — From `ERP-api`, run `dotnet run`. In Development, Swagger is at `http://localhost:8080/swagger`.
3. **Web client** — From `ERP-client`, run `npm install` then `npm run dev`. By default the app targets the API base URL in `ERP-client/src/config` (override with `VITE_API_BASE_URL` if needed).
