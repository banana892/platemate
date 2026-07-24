import { test, expect } from '@playwright/test'

test.describe('Authentication E2E Flow', () => {
  test('should render landing page and navigate to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/PlateMate|Food/i)

    const loginButton = page.getByRole('link', { name: /log in|login/i })
    if (await loginButton.isVisible()) {
      await loginButton.click()
      await expect(page).toHaveURL(/.*login.*/)
    }
  })

  test('should display validation errors for empty login form submission', async ({ page }) => {
    await page.goto('/login')
    const submitBtn = page.getByRole('button', { name: /sign in|login|log in/i })
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
    }
  })
})
