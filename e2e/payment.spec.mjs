// Credits and payment. Stripe's script is replaced by a stub (see
// mock-api.mjs) that mounts labelled boxes and resolves confirmPayment the
// way the test asks, so the page's own flow is what gets exercised.
import { expect, test } from '@playwright/test'
import { logIn, snap } from './helpers.mjs'
import { installMockApi } from './mock-api.mjs'

test('with no credits, Build a bracket leads to payment', async ({ page }) => {
  const api = await installMockApi(page, { user: { credits: 0 }, stripe: 'decline' })
  await logIn(page)
  await expect(page.getByText(/0 brackets left/i)).toBeVisible()
  await page.getByRole('button', { name: 'Build a bracket' }).click()
  await expect(page).toHaveURL(/\/payment$/)
  await expect(page.getByRole('heading', { name: 'Payment Information' })).toBeVisible()
  await expect(page.locator('.e2e-stripe-element[data-type="payment"]')).toBeVisible()
  await expect(page.locator('.e2e-stripe-element[data-type="linkAuthentication"]')).toBeVisible()
  expect(api.state.calls.some((c) => c.path === '/create-payment-intent')).toBe(true)
  await snap(page, 'payment')
})

test('the status strip links to payment', async ({ page }) => {
  await installMockApi(page, { stripe: 'decline' })
  await logIn(page)
  await page.getByRole('link', { name: 'Add credits' }).click()
  await expect(page).toHaveURL(/\/payment$/)
})

test('a declined card shows the message and leaves the button usable', async ({ page }) => {
  await installMockApi(page, { stripe: 'decline' })
  await logIn(page)
  await page.goto('/payment')
  const pay = page.getByRole('button', { name: 'Pay $0.99' })
  await expect(pay).toBeEnabled()
  await pay.click()
  await expect(page.getByText('Your card was declined.')).toBeVisible()
  await expect(pay).toBeEnabled()
  await snap(page, 'payment-declined')
})

test('a confirmed payment lands on the success page', async ({ page }) => {
  await installMockApi(page, { stripe: 'redirect' })
  await logIn(page)
  await page.goto('/payment')
  await page.getByRole('button', { name: 'Pay $0.99' }).click()
  await page.waitForURL('**/success')
  await expect(page.getByRole('heading', { name: 'Thank you!' })).toBeVisible()
  await expect(page.getByRole('link', { name: /dashboard page/i })).toBeVisible()
  await snap(page, 'success')
})
