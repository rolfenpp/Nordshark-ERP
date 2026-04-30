import { expect, test } from '@playwright/test'
import { attachApiMock } from './mock-api'

test('cold session: home → login → sign in reaches dashboard', async ({ page }) => {
  await attachApiMock(page, { refreshAccessToken: null })

  await page.goto('/')

  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 20_000 })
  await page.getByRole('button', { name: /sign in/i }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
  await expect(page.getByText('Demonstration only.', { exact: false })).toBeVisible()
})
