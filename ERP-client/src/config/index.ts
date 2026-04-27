export type AppConfig = {
  apiBaseUrl: string
  clientUrl: string
}

function normalizeApiBaseUrl(url: string): string {
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
  apiBaseUrl: normalizeApiBaseUrl(envApiBaseUrl || base.apiBaseUrl),
  clientUrl: envClientUrl || base.clientUrl,
}

export const API_URL = `${CONFIG.apiBaseUrl}`
export const API_URL_WITH_PREFIX = `${CONFIG.apiBaseUrl}/api`

