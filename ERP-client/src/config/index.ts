export type AppConfig = {
  apiBaseUrl: string
  clientUrl: string
}

function normalizeApiBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, '')
}

const MODE = import.meta.env.MODE || 'development'

const defaults: Record<string, AppConfig> = {
  development: {
    apiBaseUrl: 'http://localhost:8080/api',
    clientUrl: 'http://localhost:5173',
  },
  production: {
    apiBaseUrl: 'https://erp-api-bfp3.onrender.com/api',
    clientUrl: 'https://erp-client-flame.vercel.app',
  },
}

const envApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
const envClientUrl = (import.meta.env.VITE_CLIENT_URL as string | undefined)?.replace(/\/$/, '')

const base: AppConfig = defaults[MODE] ?? defaults.development

export const CONFIG: AppConfig = {
  apiBaseUrl: normalizeApiBaseUrl((envApiBaseUrl || base.apiBaseUrl).trim() || base.apiBaseUrl),
  clientUrl: envClientUrl || base.clientUrl,
}

/** Base URL of the API (axios `baseURL`), no trailing slash. Use a path prefix when the API is under `/api`, e.g. `https://host/api`. */
export const API_URL = CONFIG.apiBaseUrl

export const API_ROOT = CONFIG.apiBaseUrl
