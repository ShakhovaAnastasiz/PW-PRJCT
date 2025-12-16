import { test, expect, Locator } from '@playwright/test';

test('Login', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('#email').fill('customer@practicesoftwaretesting.com');
  await page.locator('#password').fill('welcome01');
  await page.getByRole('button', {name: 'Login'}).click();

  await expect (page, 'Incorrect URL').toHaveURL('/account');

  await expect(page.getByTestId('page-title'), 'Page title wasn\'t found').toHaveText('My account');

  await expect(page.getByTestId('nav-menu'), 'Username is incorrect').toContainText('Jane Doe');
});
