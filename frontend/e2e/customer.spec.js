import { test, expect } from '@playwright/test'

test.describe('Customer E2E Journey', () => {
  test('Customer browse and search restaurant journey', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')

    const searchInput = page.getByPlaceholder(/search for restaurants|search/i)
    if (await searchInput.isVisible()) {
      await searchInput.fill('Biryani')
      await page.keyboard.press('Enter')
    }
  })
})
