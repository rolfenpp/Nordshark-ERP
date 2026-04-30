import { expect, test } from '@playwright/test'
import { attachApiMock } from './mock-api'

test('logged out deep link to protected route stores redirect for post-login', async ({ page }) => {
  await attachApiMock(page, { refreshAccessToken: null })

  await page.goto('/projects')

  await expect(page).toHaveURL(/\/login/, { timeout: 20_000 })
  const u = new URL(page.url())
  const redirect = u.searchParams.get('redirect')
  expect(redirect, 'login should include redirect query').toBeTruthy()
  expect(redirect!.toLowerCase()).toContain('project')

  await page.getByRole('button', { name: /sign in/i }).click()

  await expect(page).toHaveURL(/\/projects/, { timeout: 20_000 })
})
