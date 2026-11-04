// Shared steps for the specs: the login form, a full-page screenshot that
// lands under test-results/, and the project check for width-specific asserts.
import { test } from '@playwright/test'
import { PASSWORD, USER } from './mock-api.mjs'

export const isMobile = () => test.info().project.name === 'mobile'

// animations: 'disabled' lets CSS transitions (floating labels, menus) finish
// before capture, so a screenshot under parallel load is not mid-animation.
export const snap = (page, name) =>
  page.screenshot({ path: test.info().outputPath(`${name}.png`), fullPage: true, animations: 'disabled' })

export const loginForm = {
  username: (page) => page.getByLabel('Username'),
  password: (page) => page.locator('input[type="password"]'),
  // The header carries a "Log in" button too; the submit is the last match.
  submit: (page) => page.getByRole('button', { name: 'Log in', exact: true }).last(),
}

export async function logIn(page) {
  await page.goto('/login')
  await loginForm.username(page).fill(USER.username)
  await loginForm.password(page).fill(PASSWORD)
  await loginForm.submit(page).click()
  await page.waitForURL('**/dashboard')
}

// A Vuetify field with an append icon gives the icon the same accessible
// name as its input, so getByLabel alone is ambiguous. This keeps the input.
export const input = (page, label) => page.getByLabel(label, { exact: true }).and(page.locator('input'))

// The app's toast: assert on its text, then dismiss so it cannot cover the
// next thing a test clicks.
export const toast = (page, text) => page.getByText(text, { exact: true })
