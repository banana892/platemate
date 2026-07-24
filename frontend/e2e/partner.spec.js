import { test, expect } from '@playwright/test'

test.describe('Partner E2E Journey', () => {
  test('Partner login page navigation', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/.*login.*/)
  })
})
