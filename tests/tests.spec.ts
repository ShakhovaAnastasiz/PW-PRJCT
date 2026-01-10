import { test, expect } from "@playwright/test";
import { AccountPage } from "../pages/account.page";
import { random } from "../utils/utils";

import { HomePage, ProductNames, SortType } from "../pages/home.page";
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

    await  expect(
      accountPage.pageTitleLocator,
      "Page title wasn't found"
    ).toHaveText("My account");
    await expect(
      accountPage.header.navMenuLocator,
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
    productPage.itemTitleLocator,
    "Product name is incorrect"
  ).toHaveText(productName);
  await expect(
    productPage.itemPriceLocator,
    "Product price is incorrect"
  ).toHaveText("14.15");
  await expect(
    productPage.addToCartButtonLocator,
    "Add to cart button is not visible"
  ).toBeVisible();
  await expect(
    productPage.addToFavoritesButtonLocator,
    "Add to favorites button is not visible"
  ).toBeVisible();
  await expect(
    productPage.header.navMenuLocator,
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
    productPage.itemTitleLocator,
    "Product name is incorrect"
  ).toHaveText(productName);
  //  Verify product price is 9.17.
  await expect(
    productPage.itemPriceLocator,
    "Product price is incorrect"
  ).toHaveText("9.17");

  await productPage.addToCartButtonLocator.click();
  // Verify alert message text is "Product added to shopping cart".
  await expect(
    productPage.alertProductAddedToCartLocator,
    "Alert message text is incorrect"
  ).toHaveText("Product added to shopping cart.");
  // Verify alert is shown at least for 7s.
  await expect(
    productPage.alertProductAddedToCartLocator,
    "Alert message is not visible"
  ).toBeVisible();
  await expect(
    productPage.alertProductAddedToCartLocator,
    "Alert message is not visible after 7s"
  ).toBeVisible({ timeout: 7_000 });
  // Verify alert disappears in 8 seconds.
  await expect(
    productPage.alertProductAddedToCartLocator,
    "Alert message didn't disappear"
  ).toBeHidden({ timeout: 10_000 });
  // Verify cart icon in navigation shows quantity = 1.
  await expect(
    productPage.header.cartQuantityLocator,
    "Cart quantity is incorrect"
  ).toHaveText("1");

  await productPage.header.cartIconLocator.click();
  await checkoutPage.proceedCheckoutButtonLocator.waitFor();
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
    checkoutPage.proceedCheckoutButtonLocator,
    '"Proceed to Checkout" button is not visible'
  ).toBeVisible();
});

test.describe("Sorting", () => {
  const priceSortTypes = [
    SortType.priceHighLow,
    SortType.priceLowHigh,
  ] as const;

  for (const sortBy of priceSortTypes) {
    test(`Verify user can perform sorting by price: ${sortBy}`, async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      await homePage.goToHomePage();

      const actual = await homePage.getPricesAfterSorting(sortBy);
      const expected = [...actual].sort((a, b) => a - b);

      if (sortBy === SortType.priceHighLow) {
        expected.reverse();
      }

      expect(actual).toEqual(expected);
    });
  }

  const nameSortTypes = [SortType.nameAZ, SortType.nameZA] as const;

  for (const sortBy of nameSortTypes) {
    test(`Verify user can perform sorting by name: ${sortBy}`, async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      await homePage.goToHomePage();

      const actual = await homePage.getTitlesAfterSorting(sortBy);
      const expected = [...actual].sort();

      if (sortBy === SortType.nameZA) {
        expected.reverse();
      }
 
      expect(actual).toEqual(expected);
    });
  }
});

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
