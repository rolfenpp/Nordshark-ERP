export type AppConfig = {
  apiBaseUrl: string
  clientUrl: string
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

/**
 * Base URL of the API used as axios `baseURL` (no trailing slash).
 * Include a path prefix when the host mounts the app there, e.g. `http://localhost:8080/api`.
 */
export const API_URL = CONFIG.apiBaseUrl

export const API_ROOT = CONFIG.apiBaseUrl
