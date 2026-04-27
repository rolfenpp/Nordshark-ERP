# ERP monorepo

Disclaimer: This is a hobby project, not a commercial or supported product. AI (coding assistants) was used heavily to build and evolve it; I also like to try coding agents with different contexts (separate conversations, rules, or focused tasks) to implement or adjust specific parts of the app and see how that plays out. Throughout its journey, this repository has been deleted, rebuilt, taken apart, and reassembled more than once, not a single tidy greenfield.

It is deployed to real hosting (e.g. Vercel and on Render) mainly to simulate a production-style setup: separate services, environment configuration, HTTPS, and deployment pipelines. When you work in a real environment, it is normal to land small fixes in a corner of the system you do not fully understand yet (who has not done that). Part of the goal is to observe what actually happens in production when things go wrong: a failing build or deploy, a bad release that only breaks at runtime, VITE or a wrong API base URL, CORS and SameSite cookie issues, stale cached client assets, 500s and error surfaces you do not get locally, EF migrations and DB connection string mistakes, missing or incorrect secrets, cold starts and slowness on small hosts, and the usual “works on my machine” gap—not to ship junk to end users, but to learn. None of that implies this app is production-ready for real business or sensitive data.

I also like to explore my own thinking. When a question first shows up, is it a quick patch or worth cleaning up later, and how do small choices pile on top of each other. For example, do you keep “are we logged in” in React state or lean on the cookie until you have time to read how both sides work. After you save a form, is refetch() from the server enough or do you need the API to return different fields. The first time a second API handler needs the same database filter or permission check, do you copy the code or stop and put shared logic in one place even if you are not sure what to name it yet. Demo data that should never hit production, do you only run that from a script on your machine or do you add a config flag and worry about every deploy. When the layout looks wrong on mobile, do you reach for the component the design system already gives you or a quick flex box that works for now. The point is not one “correct” architecture every time, but noticing when a decision is being made and why.

Demo: [https://erp-client-flame.vercel.app](https://erp-client-flame.vercel.app)

A business system dashboard: backend API (ASP.NET Core) and web client (React + Vite).

AI-assisted development: [Claude](https://www.anthropic.com/claude) (including Claude Code in the editor) was used for much of the backend work in `ERP-api`—API controllers, EF Core models and migrations, demo seeding, and related C#—while the React client and UX were built with a mix of other tooling and manual work.

In a big production org somewhere else, the same worries just wear a blazer. Deploying might mean a calendar event, a rubber stamp, and a prayer, not one shiny green button and a snack. Staging is “identical to prod” in the same way a cardboard cutout is identical to a person, which is how you learn a bug only likes real traffic. On call you debug a service you have never poked, from a runbook written by someone who has since retired, while the person who can open the firewall is in a time zone where it is still yesterday.(this is ai generated joke but i like it) A migration waits quietly in review while product asks if you can ship the feature before lunch. This repo is not that circus, but the jump from “I merged it” to “I sleep tonight” is the same story with fewer actors and no free pizza.

## Production vs local

- Production (deployed): Push to the branch your host uses (for example `main`). The Vercel build publishes the client; Render (or your host) runs the API with `ASPNETCORE_ENVIRONMENT=Production`. The API does not create demo companies or users on startup (only EF migrations and Identity roles). New tenants and admins are created with `POST /api/companies/register` (or the app’s Register screen), then sign in. JSON endpoints are under the `/api` prefix (e.g. `GET /api/invoices`); the client uses `VITE_API_BASE_URL` (or the default in `ERP-client/src/config`) as the full API base including `/api`, and calls paths like `/invoices` from there. Redeploy the API after you add new controllers so production stays in sync. Keep secrets in platform environment variables, not in the repository.

- Local (full stack): Run PostgreSQL (often via `ERP-api/docker-compose.dev.yml`), the API in Development (`dotnet run` in `ERP-api`), and the client (`npm run dev` in `ERP-client`). Create a tenant the same way as production (`POST /api/companies/register` or the Register screen). Demo invoices and projects are not inserted by the API; use the scripts in `ERP-client/scripts` (e.g. `npm run seed:guest:local` from `ERP-client`) after a user exists. Prefer [user secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) or env vars for passwords.

## Nordshark business system

The web client is a light themed Nordshark admin UI with left navigation, headline KPIs (invoices, revenue, users, pending amounts), a revenue trend chart, invoice status breakdown, recent activity, and top clients: typical ERP style monitoring in one view.

![Nordshark dashboard: KPIs, revenue chart, invoice status, activity, and top clients](docs/images/nordshark-dashboard.png)

## Docker (optional local stack)

You can run database services and the API with Docker Desktop using the compose file under the API project. A typical setup includes a PostgreSQL container (development data), an optional pgAdmin instance for browsing the DB, and the API container, all grouped under one compose project, as shown below.

![Docker Desktop: compose project with Postgres, pgAdmin, and API containers running locally](docs/images/docker-desktop-containers.png)

This is only a local tooling view: resource usage and port bindings are environment specific and do not reflect production. No secrets belong in screenshots; keep API keys and connection strings out of the repo (use `.env` / user secrets, never commit real credentials).

## Local development (step by step)

1. Database — From `ERP-api`, e.g. `docker compose -f docker-compose.dev.yml up -d db`. Make `ConnectionStrings:DefaultConnection` in `appsettings.Development.json` (or `ConnectionStrings__DefaultConnection` in the environment) use the same host port and database name as the container.
2. API — `cd ERP-api` → `dotnet run` → `http://localhost:8080` (Swagger: `/swagger` in Development).
3. Client — `cd ERP-client` → `npm install` → `npm run dev` → open the printed dev URL; it calls the API from `ERP-client/src/config` (override with `VITE_API_BASE_URL` for a remote API). Register a company locally first if the database is empty; optional demo data via `npm run seed:guest:local` (see Production vs local).
