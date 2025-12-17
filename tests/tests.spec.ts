import { test, expect,} from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { AccountPage } from '../pages/account.page';
import { HomePage } from '../pages/home.page';

test('Login', async ({ page }) => {
  const loginPage = new LoginPage(page); 
  const accountPage = new AccountPage(page); 
  await page.goto('/auth/login');
  await loginPage.PerformLogin('customer@practicesoftwaretesting.com', 'welcome01');
  await expect (page, 'Incorrect URL').toHaveURL('/account');
  await expect(accountPage.getPageTittleLocator(), 'Page title wasn\'t found').toHaveText('My account');
  await expect(accountPage.getNavMenuLocator(), 'Username is incorrect').toContainText('Jane Doe');
});

test('Verify unauthorized user can view product details', async ({ page }) => {
  const homePage = new HomePage(page); 
  const productName = 'Combination Pliers';

  await page.goto('/');
  await homePage.ClickOnProductCard(productName);

  await expect (page, 'Incorrect URL').toHaveURL(/\/product\/.+/);
  await expect(homePage.getTitleLocator(), 'Product name is incorrect').toHaveText(productName);
  await expect(homePage.getPriceLocator(), 'Product price is incorrect').toHaveText('14.15');
  await expect(homePage.getAddToCartButtonLocator(), 'Add to cart button is not visible').toBeVisible();
  await expect(homePage.getAddedToFavoritesLocator(), 'Add to favorites button is not visible').toBeVisible();
  await expect(homePage.getNavSignInLocator(), 'Header doesn\'t contain sign in button').toContainText('Sign in');


});