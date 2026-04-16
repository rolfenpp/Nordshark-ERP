# ERP monorepo

- **ERP-api** — ASP.NET Core API (Docker on Render). Set Render **Root Directory** to `ERP-api`.
- **ERP-client** — Vite + React (Vercel). Set Vercel **Root Directory** to `ERP-client`.

Configure `VITE_API_BASE_URL` on Vercel to your Render API URL, and `Cors:AllowedOrigins` on the API to your Vercel origin(s).
