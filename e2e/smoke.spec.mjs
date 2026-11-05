// Smoke suite: one pass through every page a user reaches, at desktop and
// phone widths (see playwright.config.js projects). Services are mocked in
// the browser by e2e/mock-api.js. Each test saves a full-page screenshot
// under test-results/ so a reviewer can look at what the run saw.
import { expect, test } from '@playwright/test'
import { isMobile, logIn, loginForm, snap } from './helpers.mjs'
import { installMockApi, USER } from './mock-api.mjs'

test.describe('logged out', () => {
  test.beforeEach(async ({ page }) => {
    await installMockApi(page)
  })

  test('home shows the pitch and a way in, and no account menu', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/forty years of history/i)
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible()
    await expect(page.locator('header').getByRole('button', { name: 'Log in', exact: true })).toBeVisible()
    await expect(page.locator('button.avatar')).toHaveCount(0)
    await snap(page, 'home')
  })

  test('wrong password stays on the login page with a message', async ({ page }) => {
    await page.goto('/login')
    await loginForm.username(page).fill(USER.username)
    await loginForm.password(page).fill('not-the-password')
    await loginForm.submit(page).click()
    await expect(page.getByText('Invalid username or password.')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.locator('button.avatar')).toHaveCount(0)
    await snap(page, 'login-rejected')
  })

  test('login button lines up with the field column', async ({ page }) => {
    await page.goto('/login')
    // Vuetify pads card actions 8px and card text 16px by default, so without
    // the matching padding the button overhangs the fields by 8px.
    const field = await page.locator('.v-card .v-input').first().boundingBox()
    const button = await loginForm.submit(page).boundingBox()
    expect(Math.abs(field.x + field.width - (button.x + button.width))).toBeLessThanOrEqual(1)
    await snap(page, 'login-button-aligned')
  })

  test('disclaimer opens from the footer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /read the full disclaimer/i }).click()
    await expect(page.getByRole('dialog')).toContainText(/entertainment purposes only/i)
  })
})

test.describe('logged in', () => {
  let api

  test.beforeEach(async ({ page }) => {
    api = await installMockApi(page)
    await logIn(page)
  })

  test('dashboard shows the status strip, bracket cards, and no admin button for a user', async ({ page }) => {
    await expect(page.getByText(/2 brackets left/i)).toBeVisible()
    await expect(page.getByText(/2 built/i)).toBeVisible()
    await expect(page.getByText(/selection sunday|the field is set/i).first()).toBeVisible()

    const cards = page.locator('.bracket-card')
    await expect(cards).toHaveCount(2)
    // Newest first: the chaos bracket was built two days after the chalk one.
    await expect(cards.nth(0)).toContainText('Chaos run')
    await expect(cards.nth(0)).toContainText(api.teamName('s3'))
    await expect(cards.nth(1)).toContainText('Chalk all the way')
    await expect(cards.nth(1)).toContainText(api.teamName('e1'))

    await expect(page.getByRole('link', { name: 'Tournament admin' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: /ncaa news/i })).toBeVisible()
    await snap(page, 'dashboard')
  })

  test('account menu lists settings and log out', async ({ page }) => {
    await page.locator('button.avatar').click()
    const menu = page.getByRole('menu').or(page.locator('.v-overlay--active .v-list'))
    await expect(menu.getByText('Settings')).toBeVisible()
    await expect(menu.getByText('Log out')).toBeVisible()
    await expect(menu.getByText('Tournament admin')).toHaveCount(0)
    await snap(page, 'account-menu')
  })

  // Desktop uses the header links; a phone hides them and uses the account
  // menu entries instead. Both must route without a full page load.
  test('header navigation reaches the builder and back to the dashboard', async ({ page }) => {
    const goTo = async (desktopLink, menuItem) => {
      if (isMobile()) {
        await expect(page.locator('.primary-nav')).toBeHidden()
        await page.locator('button.avatar').click()
        await page.locator('.v-overlay--active .v-list').getByText(menuItem, { exact: true }).click()
      } else {
        await page.locator('.primary-nav').getByRole('link', { name: desktopLink, exact: true }).click()
      }
    }

    await goTo('Build', 'Build a bracket')
    await expect(page).toHaveURL(/\/builder$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Let Buster run the field')
    if (!isMobile()) await expect(page.locator('.primary-nav .nav-link.active')).toHaveText('Build')

    await goTo('Dashboard', 'Dashboard')
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('My brackets')
    if (!isMobile()) await expect(page.locator('.primary-nav .nav-link.active')).toHaveText('Dashboard')
  })

  test('bracket page renders the full field on desktop and region tabs on a phone', async ({ page }) => {
    await page.locator('.bracket-card', { hasText: 'Chaos run' }).getByRole('link', { name: /view bracket/i }).click()
    await expect(page).toHaveURL(/\/bracket\?id=/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Chaos run')
    await expect(page.getByText(api.teamName('s3')).first()).toBeVisible()

    if (isMobile()) {
      await expect(page.locator('.compact')).toBeVisible()
      await expect(page.locator('.field')).toHaveCount(0)
      await page.getByRole('tab', { name: 'West', exact: true }).click()
      await expect(page.getByText(api.teamName('w1')).first()).toBeVisible()
    } else {
      await expect(page.locator('.field')).toBeVisible()
      await expect(page.locator('.compact')).toHaveCount(0)
      // All four region champions and both Final Four games are on one screen.
      for (const key of ['e7', 'm2', 's3', 'w2']) {
        await expect(page.locator('.field').getByText(api.teamName(key)).first()).toBeVisible()
      }
    }
    await snap(page, 'bracket')
  })

  test('breakdown shows the score and the narrative', async ({ page }) => {
    await page.locator('.bracket-card', { hasText: 'Chaos run' }).getByRole('link', { name: /breakdown/i }).click()
    await expect(page).toHaveURL(/\/breakdown\?id=/)
    await expect(page.getByRole('heading', { name: 'Chaos run' })).toBeVisible()
    await expect(page.locator('.ring-score')).toContainText('41')
    await expect(page.getByText(/leans on the favorites early/i)).toBeVisible()
    await expect(page.getByText('12 seed over 5 seed in the East')).toBeVisible()
    await snap(page, 'breakdown')
  })

  test('builder runs the simulation, saves the bracket, and returns to the dashboard', async ({ page }) => {
    await page.goto('/builder')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/let buster run the field/i)
    await page.getByLabel('Name your bracket').fill('Smoke test bracket')
    await page.getByRole('button', { name: /build my bracket/i }).click()

    // The reveal plays region by region for about nine seconds, then the
    // page saves and reloads onto the dashboard.
    await page.waitForURL('**/dashboard', { timeout: 30_000 })
    await expect(page.locator('.bracket-card')).toHaveCount(3)
    const created = page.locator('.bracket-card', { hasText: 'Smoke test bracket' })
    await expect(created).toContainText(api.teamName('s3'))
    await expect(page.getByText(/1 bracket left/i)).toBeVisible()

    const simulate = api.state.calls.find((c) => c.path === '/simulate-bracket')
    expect(simulate.body.year).toBe(new Date().getFullYear())
    const create = api.state.calls.find((c) => c.path === '/create-bracket')
    expect(create.body.name).toBe('Smoke test bracket')
    expect(create.body.bracket.finals.champion).toBe('s3')
    await snap(page, 'dashboard-after-build')
  })

  test('settings shows the account', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('input[type="email"]')).toHaveValue(USER.email)
    await snap(page, 'settings')
  })

  test('log out returns to the login page without the account menu', async ({ page }) => {
    await page.locator('button.avatar').click()
    await page.getByText('Log out').click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.locator('button.avatar')).toHaveCount(0)
  })
})
