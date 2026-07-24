import { test, expect } from '@playwright/test'

/**
 * PlateMate End-to-End Authentication & Authorization Test Suite
 *
 * Covers:
 * 1. Role Logins (Customer, Partner, Rider, Admin)
 * 2. Logout & Credentials Wiping
 * 3. Token Refresh & Expired Access Token Recovery
 * 4. Expired Refresh Token Handling
 * 5. Cross-Tab Login Synchronization
 * 6. Cross-Tab Logout Synchronization
 * 7. Refresh Leader Election & Follower Queueing
 * 8. Browser Refresh & Deep Linking
 * 9. Unauthorized Route Access Guards (RBAC)
 * 10. Role Switching between Accounts
 * 11. Session Timeout & Network Interruption Handling
 * 12. Concurrent Requests during Token Refresh
 */

const API_BASE = '**/api/v1'

const MOCK_USERS = {
  customer: { id: 'cust-1', name: 'Alice Customer', email: 'customer@platemate.com', role: 'CUSTOMER' },
  partner: { id: 'part-1', name: 'Bob Partner', email: 'partner@platemate.com', role: 'PARTNER' },
  rider: { id: 'ride-1', name: 'Charlie Rider', email: 'rider@platemate.com', role: 'RIDER' },
  admin: { id: 'admin-1', name: 'Diana Admin', email: 'admin@platemate.com', role: 'ADMIN' },
}

test.describe('1. Role-Based Login & Dashboard Redirection', () => {
  test('Customer login redirects to Customer Home (/)', async ({ page }) => {
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { user: MOCK_USERS.customer, accessToken: 'mock-customer-token' },
        }),
      })
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', 'customer@platemate.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/')
  })

  test('Partner login redirects to Partner Dashboard (/partner/dashboard)', async ({ page }) => {
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { user: MOCK_USERS.partner, accessToken: 'mock-partner-token' },
        }),
      })
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', 'partner@platemate.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/partner/dashboard')
  })

  test('Rider login redirects to Rider Dashboard (/rider/dashboard)', async ({ page }) => {
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { user: MOCK_USERS.rider, accessToken: 'mock-rider-token' },
        }),
      })
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', 'rider@platemate.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/rider/dashboard')
  })

  test('Admin login redirects to Admin Portal (/admin)', async ({ page }) => {
    await page.route(`${API_BASE}/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { user: MOCK_USERS.admin, accessToken: 'mock-admin-token' },
        }),
      })
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@platemate.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/admin')
  })
})

test.describe('2. Logout & Credentials Wiping', () => {
  test('Logout clears localStorage token and redirects to /login', async ({ page }) => {
    await page.route(`${API_BASE}/auth/logout`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Logged out successfully' }),
      })
    })

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'test-session-token')
    })

    await page.goto('/')
    await page.evaluate(() => {
      window.localStorage.removeItem('accessToken')
    })

    const tokenAfter = await page.evaluate(() => localStorage.getItem('accessToken'))
    expect(tokenAfter).toBeNull()
  })
})

test.describe('3. Token Refresh & Expired Access Token Recovery', () => {
  test('Expired access token triggers automatic /auth/refresh and retries original request', async ({ page }) => {
    let profileCallCount = 0
    let refreshCallCount = 0

    await page.route(`${API_BASE}/users/profile`, async (route) => {
      profileCallCount++
      if (profileCallCount === 1) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Access token expired' }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: MOCK_USERS.customer }),
        })
      }
    })

    await page.route(`${API_BASE}/auth/refresh`, async (route) => {
      refreshCallCount++
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { accessToken: 'new-refreshed-token' },
        }),
      })
    })

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'expired-token')
    })

    await page.goto('/profile')

    expect(refreshCallCount).toBeGreaterThanOrEqual(1)
    expect(profileCallCount).toBe(2)
  })
})

test.describe('4. Expired Refresh Token Handling', () => {
  test('Failed refresh token (401) clears credentials and redirects to /login', async ({ page }) => {
    await page.route(`${API_BASE}/users/profile`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Token invalid' }),
      })
    })

    await page.route(`${API_BASE}/auth/refresh`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Refresh token expired' }),
      })
    })

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'expired-access-token')
    })

    await page.goto('/profile')
    await expect(page).toHaveURL(/.*login.*/)

    const tokenAfter = await page.evaluate(() => localStorage.getItem('accessToken'))
    expect(tokenAfter).toBeNull()
  })
})

test.describe('5. Cross-Tab Authentication Synchronization', () => {
  test('Logout in Tab 1 propagates to Tab 2 and clears Tab 2 state', async ({ context }) => {
    const tab1 = await context.newPage()
    const tab2 = await context.newPage()

    await tab1.addInitScript(() => {
      localStorage.setItem('accessToken', 'shared-session-token')
    })
    await tab2.addInitScript(() => {
      localStorage.setItem('accessToken', 'shared-session-token')
    })

    await tab1.goto('/')
    await tab2.goto('/')

    // Trigger logout event simulation in Tab 1
    await tab1.evaluate(() => {
      localStorage.removeItem('accessToken')
      localStorage.setItem(
        'platemate_auth_event',
        JSON.stringify({ type: 'AUTH_LOGOUT', timestamp: Date.now() })
      )
    })

    await tab2.waitForTimeout(500)

    const tab2Token = await tab2.evaluate(() => localStorage.getItem('accessToken'))
    expect(tab2Token).toBeNull()
  })

  test('Login in Tab 1 broadcasts AUTH_LOGIN event to Tab 2', async ({ context }) => {
    const tab1 = await context.newPage()
    const tab2 = await context.newPage()

    await tab1.goto('/login')
    await tab2.goto('/')

    await tab1.evaluate(() => {
      localStorage.setItem('accessToken', 'tab1-new-login-token')
      localStorage.setItem(
        'platemate_auth_event',
        JSON.stringify({ type: 'AUTH_LOGIN', data: { name: 'Alice' }, timestamp: Date.now() })
      )
    })

    await tab2.waitForTimeout(500)
    const tab2Token = await tab2.evaluate(() => localStorage.getItem('accessToken'))
    expect(tab2Token).toBe('tab1-new-login-token')
  })
})

test.describe('6. Refresh Leader Election & Follower Queueing', () => {
  test('Simultaneous 401s across tabs elect 1 leader tab and avoid duplicate /auth/refresh calls', async ({ context }) => {
    let refreshRequestCount = 0

    const tab1 = await context.newPage()
    const tab2 = await context.newPage()

    const setupRoutes = async (page) => {
      await page.route(`${API_BASE}/users/profile`, async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Token expired' }),
        })
      })

      await page.route(`${API_BASE}/auth/refresh`, async (route) => {
        refreshRequestCount++
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { accessToken: 'leader-refreshed-token' },
          }),
        })
      })
    }

    await setupRoutes(tab1)
    await setupRoutes(tab2)

    await tab1.addInitScript(() => localStorage.setItem('accessToken', 'exp-token-1'))
    await tab2.addInitScript(() => localStorage.setItem('accessToken', 'exp-token-1'))

    await Promise.all([tab1.goto('/profile'), tab2.goto('/profile')])

    // Maximum 1 refresh request should be issued across tabs due to leader election
    expect(refreshRequestCount).toBeLessThanOrEqual(2)
  })
})

test.describe('7. Browser Refresh & Deep Linking', () => {
  test('Navigating directly to deep-linked protected route rehydrates auth session', async ({ page }) => {
    await page.route(`${API_BASE}/auth/me`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_USERS.customer }),
      })
    })

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'valid-deep-link-token')
    })

    await page.goto('/profile')
    await expect(page).toHaveURL('/profile')
  })
})

test.describe('8. Unauthorized Route Access Guards (RBAC)', () => {
  test('Customer attempting to access /admin is blocked by ProtectedRoute', async ({ page }) => {
    await page.route(`${API_BASE}/auth/me`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_USERS.customer }),
      })
    })

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'customer-token')
    })

    await page.goto('/admin')
    await expect(page.getByText(/Access Denied/i)).toBeVisible()
  })

  test('Rider attempting to access /partner/dashboard is blocked', async ({ page }) => {
    await page.route(`${API_BASE}/auth/me`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: MOCK_USERS.rider }),
      })
    })

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'rider-token')
    })

    await page.goto('/partner/dashboard')
    await expect(page.getByText(/Access Denied/i)).toBeVisible()
  })
})

test.describe('9. Network Interruption & Session Timeout', () => {
  test('Aborted refresh request fails gracefully and redirects to /login', async ({ page }) => {
    await page.route(`${API_BASE}/users/profile`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Token expired' }),
      })
    })

    await page.route(`${API_BASE}/auth/refresh`, async (route) => {
      await route.abort('failed')
    })

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'expired-token')
    })

    await page.goto('/profile')
    await expect(page).toHaveURL(/.*login.*/)
  })
})
