// Account lifecycle: creating an account, forgetting and resetting a
// password, and editing the profile and password from Settings.
import { expect, test } from '@playwright/test'
import { input, logIn, snap, toast } from './helpers.mjs'
import { installMockApi, PASSWORD, RESET_TOKEN, USER } from './mock-api.mjs'

const STRONG_PASSWORD = 'Str0ng!pass'

test.describe('create an account', () => {
  let api

  test.beforeEach(async ({ page }) => {
    api = await installMockApi(page)
    await page.goto('/login')
    await page.getByRole('button', { name: 'New here?' }).click()
  })

  test('submit stays disabled until every field and password rule is met', async ({ page }) => {
    const submit = page.getByRole('button', { name: 'Submit Profile' })
    await expect(submit).toBeDisabled()

    await page.getByLabel('First Name').fill('New')
    await page.getByLabel('Last Name').fill('Person')
    await page.getByLabel('Email').fill('new.person@example.com')
    await page.getByLabel('Username').fill('newperson')
    await input(page, 'Enter New Password').fill(STRONG_PASSWORD)
    await input(page, 'Reenter Password').fill('different')
    await expect(page.locator('.red-span')).toHaveCount(1)
    await expect(page.locator('.red-span')).toContainText('Passwords match')
    await expect(submit).toBeDisabled()

    await input(page, 'Reenter Password').fill(STRONG_PASSWORD)
    await expect(page.locator('.red-span')).toHaveCount(0)
    await expect(page.locator('.green-span')).toHaveCount(5)
    await expect(submit).toBeEnabled()
    await snap(page, 'create-account-ready')

    await submit.click()
    await expect(toast(page, 'Thanks for creating an account with us. You will be redirected to login.')).toBeVisible()
    const create = api.state.calls.find((c) => c.path === '/create-user')
    expect(create.body).toMatchObject({
      username: 'newperson',
      email: 'new.person@example.com',
      name: 'New Person',
      password: STRONG_PASSWORD,
    })
    await page.waitForURL('**/login')
    await expect(page.getByRole('button', { name: 'New here?' })).toBeVisible()
  })

  test('a taken username is reported', async ({ page }) => {
    await page.getByLabel('First Name').fill('Same')
    await page.getByLabel('Last Name').fill('Name')
    await page.getByLabel('Email').fill('someone.else@example.com')
    await page.getByLabel('Username').fill(USER.username)
    await input(page, 'Enter New Password').fill(STRONG_PASSWORD)
    await input(page, 'Reenter Password').fill(STRONG_PASSWORD)
    await page.getByRole('button', { name: 'Submit Profile' }).click()
    await expect(toast(page, 'A user with this username or email already exists, please try again')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Submit Profile' })).toBeVisible()
  })

  test('the close button returns to the login form', async ({ page }) => {
    await page.getByRole('button', { name: 'Close' }).click()
    await expect(page.getByRole('button', { name: 'New here?' })).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
  })
})

test.describe('forgot password', () => {
  test('sends a reset link for the entered email', async ({ page }) => {
    const api = await installMockApi(page)
    await page.goto('/login')
    await page.getByRole('button', { name: 'Forgot Password?' }).click()
    const send = page.getByRole('button', { name: 'Send Reset Link' })
    await expect(send).toBeDisabled()
    await page.getByLabel('Email').fill(USER.email)
    await expect(send).toBeEnabled()
    await snap(page, 'forgot-password')
    await send.click()
    await expect(toast(page, 'If an account with that email exists, a reset link has been sent. Check your inbox!')).toBeVisible()
    expect(api.state.calls.find((c) => c.path === '/forgot-password').body).toEqual({ email: USER.email })
    // The form folds back up.
    await expect(send).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Forgot Password?' })).toBeVisible()
  })

  test('cancel folds the form back up without sending', async ({ page }) => {
    const api = await installMockApi(page)
    await page.goto('/login')
    await page.getByRole('button', { name: 'Forgot Password?' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('button', { name: 'Send Reset Link' })).toHaveCount(0)
    expect(api.state.calls.some((c) => c.path === '/forgot-password')).toBe(false)
  })
})

test.describe('reset password', () => {
  test('without a token the page says the link is invalid', async ({ page }) => {
    await installMockApi(page)
    await page.goto('/reset-password')
    await expect(page.getByText('This reset link is invalid or has expired.')).toBeVisible()
    await page.getByRole('button', { name: 'Back to Login' }).click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('a valid token resets the password once the rules are met', async ({ page }) => {
    const api = await installMockApi(page)
    await page.goto(`/reset-password?token=${RESET_TOKEN}`)
    const reset = page.getByRole('button', { name: 'Reset Password' })
    await expect(reset).toBeDisabled()
    await input(page, 'New Password').fill('weak')
    await input(page, 'Confirm New Password').fill('weak')
    await expect(page.locator('.red-span')).toHaveCount(4)
    await expect(reset).toBeDisabled()

    await input(page, 'New Password').fill(STRONG_PASSWORD)
    await input(page, 'Confirm New Password').fill(STRONG_PASSWORD)
    await expect(page.locator('.green-span')).toHaveCount(5)
    await snap(page, 'reset-password-ready')
    await reset.click()
    await expect(page.getByText('Your password has been reset!')).toBeVisible()
    expect(api.state.calls.find((c) => c.path === '/reset-password').body).toEqual({
      token: RESET_TOKEN,
      newPassword: STRONG_PASSWORD,
    })
    await page.getByRole('button', { name: 'Go to Login' }).click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('an expired token shows the failed state', async ({ page }) => {
    await installMockApi(page)
    await page.goto('/reset-password?token=stale')
    await input(page, 'New Password').fill(STRONG_PASSWORD)
    await input(page, 'Confirm New Password').fill(STRONG_PASSWORD)
    await page.getByRole('button', { name: 'Reset Password' }).click()
    // The service's reason shows in the toast and the card flips to the failed state.
    await expect(toast(page, 'That reset token has expired.')).toBeVisible()
    await expect(page.getByText('This reset link is invalid or has expired.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back to Login' })).toBeVisible()
  })
})

test.describe('settings', () => {
  let api

  test.beforeEach(async ({ page }) => {
    api = await installMockApi(page)
    await logIn(page)
    await page.goto('/settings')
  })

  test('fields are read-only until Edit, and Save sends the profile', async ({ page }) => {
    const firstName = page.getByLabel('First name')
    await expect(firstName).toHaveValue('User')
    await expect(firstName).toHaveAttribute('readonly', '')
    await expect(page.getByLabel('Credits Remaining')).toHaveValue(String(USER.credits))

    await page.getByRole('button', { name: 'Edit' }).click()
    await expect(firstName).not.toHaveAttribute('readonly', '')
    await firstName.fill('Uma')
    await snap(page, 'settings-editing')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(toast(page, 'Account saved!')).toBeVisible()
    expect(api.state.calls.find((c) => c.path === '/edit-user').body).toMatchObject({
      firstName: 'Uma',
      lastName: 'One',
      email: USER.email,
    })
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
  })

  test('Cancel discards an edit', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).click()
    await page.getByLabel('First name').fill('Nope')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByLabel('First name')).toHaveValue('User')
    expect(api.state.calls.some((c) => c.path === '/edit-user')).toBe(false)
  })

  test('changing the password needs the current one and a strong new one', async ({ page }) => {
    await page.getByRole('button', { name: 'Change Password' }).click()
    const update = page.getByRole('button', { name: 'Update Password' })
    await expect(update).toBeDisabled()
    await input(page, 'Current Password').fill('wrong-current')
    await input(page, 'New Password').fill(STRONG_PASSWORD)
    await input(page, 'Confirm New Password').fill(STRONG_PASSWORD)
    await expect(update).toBeEnabled()
    await update.click()
    await expect(toast(page, 'Current password is incorrect.')).toBeVisible()

    await input(page, 'Current Password').fill(PASSWORD)
    await update.click()
    await expect(toast(page, 'Password updated successfully!')).toBeVisible()
    expect(api.state.calls.filter((c) => c.path === '/change-password').at(-1).body).toEqual({
      currentPassword: PASSWORD,
      newPassword: STRONG_PASSWORD,
    })
    // The section closes after success.
    await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible()
  })
})
