import type { Page, Route } from '@playwright/test'

export type ApiMockControls = {
  refreshAccessToken: string | null
  loginToken: string
  persistRefreshUnauthorized: boolean
  persistInvoiceDetail401: boolean
}

export function slugUnderApi(url: URL): string {
  const trimmed = url.pathname.replace(/^\/+/, '').split('/').filter(Boolean)
  if (!trimmed.length || trimmed[0].toLowerCase() !== 'api') return ''
  return `/${trimmed.slice(1).join('/')}`
}

export function isDevApiRequest(requestUrl: string): boolean {
  try {
    const u = new URL(requestUrl)
    const hostOk =
      u.hostname === 'localhost' ||
      u.hostname === '127.0.0.1' ||
      u.hostname === '[::1]'
    const portOk = u.port === '8080'
    const pathOk = u.pathname.startsWith('/api/')
    return hostOk && portOk && pathOk
  } catch {
    return false
  }
}

function corsFor(route: Route): Record<string, string> {
  const headers = route.request().headers()
  const origin = headers['origin'] ?? 'http://localhost:5173'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
  }
}

export async function attachApiMock(page: Page, overrides: Partial<ApiMockControls> = {}) {
  const controls: ApiMockControls = {
    refreshAccessToken: null,
    loginToken: 'e2e-mock-access-token',
    persistRefreshUnauthorized: false,
    persistInvoiceDetail401: false,
    ...overrides,
  }

  await page.route('**/*', async (route: Route) => {
    const urlString = route.request().url()
    if (!isDevApiRequest(urlString)) {
      await route.continue()
      return
    }

    const cro = corsFor(route)
    const json = { ...cro, 'Content-Type': 'application/json' }

    if (route.request().method() === 'OPTIONS') {
      const hdrs = route.request().headers()
      await route.fulfill({
        status: 204,
        headers: {
          ...cro,
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers':
            hdrs['access-control-request-headers'] || 'authorization, content-type',
          'Access-Control-Max-Age': '86400',
        },
      })
      return
    }

    const url = new URL(urlString)
    const slug = slugUnderApi(url)
    const method = route.request().method()

    const isDetailInvoice = /^\/invoices\/\d+$/i.test(slug)

    if (method === 'POST' && /^\/account\/refresh$/i.test(slug)) {
      if (controls.persistRefreshUnauthorized) {
        await route.fulfill({ status: 401, headers: { ...cro, ...json }, body: '{}' })
        return
      }
      const t = controls.refreshAccessToken
      if (t == null || t === '') await route.fulfill({ status: 200, headers: json, body: '{}' })
      else await route.fulfill({ status: 200, headers: json, body: JSON.stringify({ accessToken: t }) })
      return
    }

    if (method === 'POST' && /^\/account\/login$/i.test(slug)) {
      await route.fulfill({
        status: 200,
        headers: json,
        body: JSON.stringify({ token: controls.loginToken }),
      })
      return
    }

    if (method === 'POST' && /^\/account\/logout$/i.test(slug)) {
      await route.fulfill({ status: 204, headers: cro, body: '' })
      return
    }

    if (method === 'GET' && /^\/users\/?$/i.test(slug)) {
      await route.fulfill({ status: 200, headers: json, body: '[]' })
      return
    }

    if (method === 'GET' && /^\/invoices\/?$/i.test(slug)) {
      await route.fulfill({ status: 200, headers: json, body: '[]' })
      return
    }

    if (method === 'GET' && isDetailInvoice && controls.persistInvoiceDetail401) {
      await route.fulfill({ status: 401, headers: { ...cro, ...json }, body: '{}' })
      return
    }

    if (method === 'GET' && isDetailInvoice) {
      await route.fulfill({
        status: 200,
        headers: json,
        body: JSON.stringify({
          id: 1,
          invoiceNumber: 'E2E-1',
          issueDate: '2026-01-01',
          dueDate: '2026-02-01',
          clientName: 'E2E Client',
          clientEmail: 'client@example.com',
          status: 'draft',
          subtotal: 100,
          taxAmount: 10,
          total: 110,
          taxRatePercent: 10,
          currency: 'USD',
          createdUtc: '2026-01-01T00:00:00Z',
          lines: [{ id: 1, lineNumber: 1, description: 'Item', quantity: 1, unitPrice: 100, amount: 100 }],
        }),
      })
      return
    }

    if (method === 'GET' && /^\/projects\/?$/i.test(slug)) {
      await route.fulfill({ status: 200, headers: json, body: '[]' })
      return
    }

    if (method === 'GET' && /^\/inventory\/?$/i.test(slug)) {
      await route.fulfill({ status: 200, headers: json, body: '[]' })
      return
    }

    await route.fulfill({
      status: 404,
      headers: json,
      body: JSON.stringify({ message: 'unmocked e2e endpoint', slug }),
    })
  })

  return { controls }
}
