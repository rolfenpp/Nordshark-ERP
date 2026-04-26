# ERP monorepo

**Demo (web client):** [https://erp-client-flame.vercel.app](https://erp-client-flame.vercel.app)

A **business system dashboard** — **backend API** (`ERP-api`, ASP.NET Core) and **web client** (`ERP-client`, React + Vite).

## Preview

This is the **Nordshark**-styled admin UI: a light-themed dashboard with left navigation, headline KPIs (invoices, revenue, users, pending amounts), a revenue trend chart, invoice status breakdown, recent activity, and top clients—typical ERP-style monitoring in one view.

![Nordshark dashboard: KPIs, revenue chart, invoice status, activity, and top clients](docs/images/nordshark-dashboard.png)

## Docker (optional local stack)

You can run database services and the API with Docker Desktop using the compose file under `ERP-api`. A typical setup includes a **PostgreSQL** container (development data), an **optional pgAdmin** instance for browsing the DB, and the **API** container—all grouped under one compose project, as shown below.

![Docker Desktop: compose project with Postgres, pgAdmin, and API containers running locally](docs/images/docker-desktop-containers.png)

This is only a **local tooling** view: resource usage and port bindings are environment-specific and do not reflect production. No secrets belong in screenshots; keep API keys and connection strings out of the repo (use `.env` / user secrets, never commit real credentials).
