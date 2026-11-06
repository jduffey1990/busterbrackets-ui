// The states a page can be in beyond the happy path: a breakdown before
// the tournament or without the AI recap, a builder with no field yet, a
// boosted team, and the router's redirects.
import { expect, test } from '@playwright/test'
import { logIn, snap } from './helpers.mjs'
import { installMockApi } from './mock-api.mjs'

const CHALK_ID = '6e2e0000000000000000b001'

test('breakdown before the tournament is a preview, and copes without the AI recap', async ({ page }) => {
  await installMockApi(page, {
    breakdowns: {
      [CHALK_ID]: { content: null, isPostTournament: false, stats: { correctPicks: 0, totalGames: 63, upsets: [] } },
    },
  })
  await logIn(page)
  await page.goto(`/breakdown?id=${CHALK_ID}`)
  await expect(page.getByRole('heading', { name: 'Chalk all the way' })).toBeVisible()
  await expect(page.getByText('Preview', { exact: true })).toBeVisible()
  await expect(page.locator('.ring-score')).toHaveCount(0)
  await expect(page.getByText(/chalk-heavy bracket/i)).toBeVisible()
  await expect(page.getByText('The AI recap is temporarily unavailable. Your stats are above.')).toBeVisible()
  await snap(page, 'breakdown-preview')
})

test('breakdown for an unknown bracket says so instead of hanging', async ({ page }) => {
  await installMockApi(page)
  await logIn(page)
  await page.goto('/breakdown?id=6e2e0000000000000000dead')
  await expect(page.getByText('Unable to generate breakdown.')).toBeVisible()
})

test('builder without a field for this year explains, and still builds', async ({ page }) => {
  const api = await installMockApi(page, { noField: true })
  await logIn(page)
  await page.goto('/builder')
  await expect(page.getByText(/official bracket hasn't been released yet/i)).toBeVisible()
  await snap(page, 'builder-no-field')
  await page.getByLabel('Name your bracket').fill('Early bird')
  await page.getByRole('button', { name: /build my bracket/i }).click()
  await page.waitForURL('**/dashboard', { timeout: 30_000 })
  const simulate = api.state.calls.find((c) => c.path === '/simulate-bracket')
  expect(simulate.body.favorite).toBeUndefined()
  expect(simulate.body.boost).toBe(0)
})

test('builder sends the boosted team and its edge', async ({ page }) => {
  const api = await installMockApi(page)
  await logIn(page)
  await page.goto('/builder')
  await page.getByLabel('Pick your team').fill('Duke')
  await page.getByRole('option', { name: 'Duke', exact: true }).click()
  // The select's label is aria-hidden in Vuetify, so find it by its text;
  // the first option is "None", the second is the smallest real edge.
  await page.locator('.v-select', { hasText: 'How much of an edge?' }).click()
  await page.getByRole('option').nth(1).click()
  await snap(page, 'builder-boosted')
  await page.getByLabel('Name your bracket').fill('Go Duke')
  await page.getByRole('button', { name: /build my bracket/i }).click()
  await page.waitForURL('**/dashboard', { timeout: 30_000 })
  const simulate = api.state.calls.find((c) => c.path === '/simulate-bracket')
  expect(simulate.body.favorite).toBe('e1')
  expect(simulate.body.boost).toBeGreaterThan(0)
})

test('home redirects to the dashboard while logged in', async ({ page }) => {
  await installMockApi(page)
  await logIn(page)
  await page.goto('/')
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('an unknown path goes home', async ({ page }) => {
  await installMockApi(page)
  await page.goto('/definitely-not-a-page')
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/forty years of history/i)
})
