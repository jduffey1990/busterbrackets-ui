// Tournament admin: the route guard, and entering a field and its results.
import { expect, test } from '@playwright/test'
import { logIn, snap } from './helpers.mjs'
import { FIELD_YEAR, installMockApi } from './mock-api.mjs'

test('a plain user is bounced from /admin to the dashboard', async ({ page }) => {
  await installMockApi(page)
  await logIn(page)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Tournament Admin' })).toHaveCount(0)
})

test('logged out, /admin goes to the login page', async ({ page }) => {
  await installMockApi(page)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login$/)
})

test.describe('as an admin', () => {
  let api

  test.beforeEach(async ({ page }) => {
    api = await installMockApi(page, { user: { role: 'admin' } })
    await logIn(page)
  })

  test('the dashboard and account menu offer the admin page', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Tournament admin' })).toBeVisible()
    await page.locator('button.avatar').click()
    await expect(page.locator('.v-overlay--active .v-list').getByText('Tournament admin')).toBeVisible()
  })

  test('the current field loads, and team edits are saved for that year', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Tournament Admin' })).toBeVisible()
    await expect(page.getByText('64/64 filled')).toBeVisible()
    await expect(page.getByText('Results entered')).toBeVisible()
    const eastOne = page.getByLabel('1 Seed').first()
    await expect(eastOne).toHaveValue(api.teamName('e1'))

    await eastOne.fill('Duke Blue Devils')
    await snap(page, 'admin-teams')
    await page.getByRole('button', { name: 'Update Teams' }).click()
    await expect(page.getByText('Teams updated successfully!')).toBeVisible()
    const put = api.state.calls.find((c) => c.method === 'PUT' && c.path === '/tournament-data/teams')
    expect(put.body.year).toBe(FIELD_YEAR)
    expect(put.body.teams.e1).toBe('Duke Blue Devils')
    expect(Object.keys(put.body.teams)).toHaveLength(64)
  })

  test('results are saved with the Final Four in played order', async ({ page }) => {
    await page.goto('/admin')
    await page.getByRole('tab', { name: 'Finals' }).click()
    await expect(page.getByText('Final Four teams, in the order the semifinals are played')).toBeVisible()
    await page.getByRole('button', { name: 'Save Results' }).click()
    await expect(page.getByText('Results saved successfully!')).toBeVisible()
    const put = api.state.calls.find((c) => c.method === 'PUT' && c.path === '/tournament-data/results')
    expect(put.body.year).toBe(FIELD_YEAR)
    expect(put.body.results.finals).toEqual(api.tournament.results.finals)
  })

  test('a new year starts empty and cannot be created until all 64 teams are in', async ({ page }) => {
    await page.goto('/admin')
    await page.getByLabel('New Year').fill(String(FIELD_YEAR + 1))
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await expect(page.getByText(`${FIELD_YEAR + 1} Teams`)).toBeVisible()
    await expect(page.getByText('0/64 filled')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Tournament' })).toBeDisabled()
    await expect(page.getByText(`${FIELD_YEAR + 1} Results`)).toHaveCount(0)
    await snap(page, 'admin-new-year')
  })
})
