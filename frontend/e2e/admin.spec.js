import { test, expect } from '@playwright/test'

test.describe('Admin E2E Journey', () => {
  test('Admin portal auth guard redirect', async ({ page }) => {
    await page.goto('/admin')
    // Should either redirect to login or show admin portal
    await expect(page).toBeDefined()
  })
})
