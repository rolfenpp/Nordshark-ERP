export type AppConfig = {
  apiBaseUrl: string
  clientUrl: string
}

function trimApiBase(url: string): string {
  let u = url.trim().replace(/\/$/, '')
  if (/\/api$/i.test(u)) {
    u = u.replace(/\/api$/i, '')
  }
  return u
}

const MODE = import.meta.env.MODE || 'development'

const defaults: Record<string, AppConfig> = {
  development: {
    apiBaseUrl: 'http://localhost:8080',
    clientUrl: 'http://localhost:5173',
  },
  production: {
    apiBaseUrl: 'https://erp-api-bfp3.onrender.com',
    clientUrl: 'https://erp-client-flame.vercel.app',
  },
}

const envApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
const envClientUrl = (import.meta.env.VITE_CLIENT_URL as string | undefined)?.replace(/\/$/, '')

const base: AppConfig = defaults[MODE] ?? defaults.development

export const CONFIG: AppConfig = {
  apiBaseUrl: trimApiBase((envApiBaseUrl || base.apiBaseUrl).trim() || base.apiBaseUrl),
  clientUrl: envClientUrl || base.clientUrl,
}

/** Base URL of the API (no `/api` path segment). */
export const API_URL = CONFIG.apiBaseUrl

/** Same as `API_URL` — used as axios `baseURL` for all backend calls. */
export const API_ROOT = CONFIG.apiBaseUrl
