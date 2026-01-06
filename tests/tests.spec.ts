import { test, expect } from "@playwright/test";
import { AccountPage } from "../pages/account.page";
import { random } from "../utils/utils";

import {
  HomePage,
  ProductNames,
  SortType,
} from "../pages/home.page";
import { ProductPage } from "../pages/product.page";
import { CheckoutPage } from "../pages/checkout.page";

const authFile = "playwright/.auth/user.json";

test.describe("Authenticated user tests", () => {
  test.use({ storageState: authFile });
  test("Login", async ({ page }) => {
    test.skip(
      !!process.env.CI,
      "Test is skipped in CI due to the Cloudflare protection."
    );

    const accountPage = new AccountPage(page);
    await page.goto("/account");

    await expect(
      accountPage.getPageTittleLocator(),
      "Page title wasn't found"
    ).toHaveText("My account");
    await expect(
      accountPage.getNavMenuLocator(),
      "Username is incorrect"
    ).toContainText("Jane Doe");
  });
});

test("Verify unauthorized user can view product details", async ({ page }) => {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const productName = ProductNames.combinationPliers;

  await homePage.goToHomePage();
  await homePage.clickOnProductCard(productName);

  await expect(page, "Incorrect URL").toHaveURL(/\/product\/.+/);
  await expect(
    productPage.getTitleLocator(),
    "Product name is incorrect"
  ).toHaveText(productName);
  await expect(
    productPage.getPriceLocator(),
    "Product price is incorrect"
  ).toHaveText("14.15");
  await expect(
    productPage.getAddToCartButtonLocator(),
    "Add to cart button is not visible"
  ).toBeVisible();
  await expect(
    productPage.getAddToFavoritesButtonLocator(),
    "Add to favorites button is not visible"
  ).toBeVisible();
  await expect(
    productPage.getNavSignInLocator(),
    "Header doesn't contain sign in button"
  ).toContainText("Sign in");
});

test("Verify user can add product to cart", async ({ page }) => {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const checkoutPage = new CheckoutPage(page);
  const productName = ProductNames.slipJointPliers;

  await homePage.goToHomePage();
  await homePage.clickOnProductCard(productName);
  // Verify product name is "Slip Joint Pliers".
  await expect(
    productPage.getTitleLocator(),
    "Product name is incorrect"
  ).toHaveText(productName);
  //  Verify product price is 9.17.
  await expect(
    productPage.getPriceLocator(),
    "Product price is incorrect"
  ).toHaveText("9.17");

  await productPage.getAddToCartButtonLocator().click();
  // Verify alert message text is "Product added to shopping cart".
  await expect(
    productPage.getAlertProductAddedToCartLocator(),
    "Alert message text is incorrect"
  ).toHaveText("Product added to shopping cart.");
  // Verify alert is shown at least for 7s.
  await expect(
    productPage.getAlertProductAddedToCartLocator(),
    "Alert message is not visible"
  ).toBeVisible();
  await expect(
    productPage.getAlertProductAddedToCartLocator(),
    "Alert message is not visible after 7s"
  ).toBeVisible({ timeout: 7_000 });
  // Verify alert disappears in 8 seconds.
  await expect(
    productPage.getAlertProductAddedToCartLocator(),
    "Alert message didn't disappear"
  ).toBeHidden({ timeout: 10_000 });
  // Verify cart icon in navigation shows quantity = 1.
  await expect(
    productPage.header.getCartQuantityLocator(),
    "Cart quantity is incorrect"
  ).toHaveText("1");

  await productPage.header.getCartIconLocator().click();
  await checkoutPage.getProceedCheckoutButtonLocator().waitFor();
  const productsInCart = await checkoutPage.getProductsInCart();
  // Verify the number of products in the cart table equals 1.
  expect(
    productsInCart.length,
    "Number of products in the cart is incorrect"
  ).toBe(1);
  // Verify product title in the cart is "Slip Joint Pliers".
  expect(productsInCart[0].name, "Product title in the cart is incorrect").toBe(
    productName
  );
  // Verify "Proceed to Checkout" button is visible.
  await expect(
    checkoutPage.getProceedCheckoutButtonLocator(),
    '"Proceed to Checkout" button is not visible'
  ).toBeVisible();
});

[
  SortType.priceHighLow,
  SortType.priceLowHigh,
  SortType.nameAZ,
  SortType.nameZA,
].forEach((sortBy) => {
  test(`Verify user can perform sorting by name ${sortBy}`, async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    await homePage.goToHomePage();
    const sortFunction = [
      SortType.priceHighLow,
      SortType.priceLowHigh,
    ].includes(sortBy)
      ? homePage.sortedByPrice
      : homePage.sortedByTitle;

    const { actualResult, expectedResult } =
      await sortFunction(sortBy); //reciving error Argument of type 'SortType' is not assignable to parameter of type 'never'. What is better way to fix it?

    expect(actualResult).toEqual(expectedResult);
  });
});

/* will delete it after merge
[SortType.priceHighLow, SortType.priceLowHigh].forEach((sorting) => {
  test(`Verify user can perform sorting by price ${sorting}`, async ({
    page,
  }) => {
    const homePage = new HomePage(page);

    await homePage.goToHomePage();
    const { actualPrices, sortedPrices } = await homePage.sortedByPrice(
      sorting as SortType.priceLowHigh | SortType.priceHighLow
    );
    expect(actualPrices).toEqual(sortedPrices);
  });
});
*/

test("Verify user can filter products by category", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goToHomePage();

  const randomCategory = random(homePage.allCategories);
  const categoryFilterLocator =
    homePage.getCategoryFilterLocator(randomCategory);
  await categoryFilterLocator.check();
  await homePage.getItemTitleLocator(randomCategory).first().waitFor();

  const productTitles = await homePage.getAllVisibleTitles();
  productTitles.forEach((title) =>
    expect(
      title,
      `Some product "${title}" does not belong to the selected category "${randomCategory}"`
    ).toContain(randomCategory)
  );
});
