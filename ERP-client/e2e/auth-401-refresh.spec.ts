import { expect, test } from '@playwright/test'
import { attachApiMock } from './mock-api'

test('401 on resource + failed refresh clears session and returns to login', async ({ page }) => {
  const { controls } = await attachApiMock(page, {
    refreshAccessToken: 'e2e-existing-session',
  })

  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
  await expect(page.getByText('Demonstration only.', { exact: false })).toBeVisible()

  controls.persistInvoiceDetail401 = true
  controls.persistRefreshUnauthorized = true

  await page.goto('/invoices/1')

  await expect(page).toHaveURL(/\/login/, { timeout: 25_000 })
})
