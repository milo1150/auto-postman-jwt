import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import { updatePostmanJwt } from '../utils/postman'

dotenv.config() // Load .env

test('Extract token from login response', async ({ page }) => {
  // UI step
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes('/auth/login') && res.request().method() === 'POST'
    ),
    await page.goto('http://localhost:3000/login'),
    await page.getByTestId('username').fill(process.env.USERNAME as string),
    await page.getByTestId('password').fill(process.env.PASSWORD as string),
    await page.getByTestId('login-button').click(),
  ])

  // Extract the response body
  const data = await response.json()
  const token = data.token
  console.log('token:', token)
  expect(token).toBeDefined()

  await updatePostmanJwt(token)
})
