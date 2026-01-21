import { expect } from "@playwright/test";
import { random } from "../utils/utils";
import { test } from "../fixtures";
import { ProductNames } from "../testData/productNames";
import { SortType } from "../testData/sortTypes";
import { PaymentData } from "../testData/paymentData";

const authFile = "playwright/.auth/user.json";

test.describe("Authenticated user tests", () => {
  test.use({ storageState: authFile });
  test("Login", async ({ page, app }) => {
    test.skip(
      !!process.env.CI,
      "Test is skipped in CI due to the Cloudflare protection.",
    );

    await page.goto("/account");

    await expect(
      app.accountPage.pageTitleLocator,
      "Page title wasn't found",
    ).toHaveText("My account");
    await expect(
      app.accountPage.header.navMenuLocator,
      "Username is incorrect",
    ).toContainText("Jane Doe");
  });
});

test("Verify unauthorized user can view product details", async ({
  page,
  app,
}) => {
  const productName = ProductNames.combinationPliers;

  await app.homePage.goToHomePage();
  await app.homePage.clickOnProductCard(productName);

  await expect(page, "Incorrect URL").toHaveURL(/\/product\/.+/);
  await expect(
    app.productPage.itemTitleLocator,
    "Product name is incorrect",
  ).toHaveText(productName);
  await expect(
    app.productPage.itemPriceLocator,
    "Product price is incorrect",
  ).toHaveText("14.15");
  await expect(
    app.productPage.addToCartButtonLocator,
    "Add to cart button is not visible",
  ).toBeVisible();
  await expect(
    app.productPage.addToFavoritesButtonLocator,
    "Add to favorites button is not visible",
  ).toBeVisible();
  await expect(
    app.productPage.header.navMenuLocator,
    "Header doesn't contain sign in button",
  ).toContainText("Sign in");
});

test("Verify user can add product to cart", async ({ app }) => {
  const productName = ProductNames.slipJointPliers;

  await app.homePage.goToHomePage();
  await app.homePage.clickOnProductCard(productName);
  // Verify product name is "Slip Joint Pliers".
  await expect(
    app.productPage.itemTitleLocator,
    "Product name is incorrect",
  ).toHaveText(productName);
  //  Verify product price is 9.17.
  await expect(
    app.productPage.itemPriceLocator,
    "Product price is incorrect",
  ).toHaveText("9.17");

  await app.productPage.addToCartButtonLocator.click();
  // Verify alert message text is "Product added to shopping cart".
  await expect(
    app.productPage.alertProductAddedToCartLocator,
    "Alert message text is incorrect",
  ).toHaveText("Product added to shopping cart.");
  // Verify alert is shown at least for 7s.
  await expect(
    app.productPage.alertProductAddedToCartLocator,
    "Alert message is not visible",
  ).toBeVisible();
  await expect(
    app.productPage.alertProductAddedToCartLocator,
    "Alert message is not visible after 7s",
  ).toBeVisible({ timeout: 7_000 });
  // Verify alert disappears in 8 seconds.
  await expect(
    app.productPage.alertProductAddedToCartLocator,
    "Alert message didn't disappear",
  ).toBeHidden({ timeout: 10_000 });
  // Verify cart icon in navigation shows quantity = 1.
  await expect(
    app.productPage.header.cartQuantityLocator,
    "Cart quantity is incorrect",
  ).toHaveText("1");

  await app.productPage.header.cartIconLocator.click();
  await app.checkoutPage.proceedCheckoutButton1Locator.waitFor();
  const productsInCart = await app.checkoutPage.getProductsInCart();
  // Verify the number of products in the cart table equals 1.
  expect(
    productsInCart.length,
    "Number of products in the cart is incorrect",
  ).toBe(1);
  // Verify product title in the cart is "Slip Joint Pliers".
  expect(productsInCart[0].name, "Product title in the cart is incorrect").toBe(
    productName,
  );
  // Verify "Proceed to Checkout" button is visible.
  await expect(
    app.checkoutPage.proceedCheckoutButton1Locator,
    '"Proceed to Checkout" button is not visible',
  ).toBeVisible();
});

test.describe("Sorting", () => {
  const priceSortTypes = [
    SortType.priceHighLow,
    SortType.priceLowHigh,
  ] as const;

  for (const sortBy of priceSortTypes) {
    test(`Verify user can perform sorting by price: ${sortBy}`, async ({
      app,
    }) => {
      await app.homePage.goToHomePage();

      const actual = await app.homePage.getPricesAfterSorting(sortBy);
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
      app,
    }) => {
      await app.homePage.goToHomePage();

      const actual = await app.homePage.getTitlesAfterSorting(sortBy);
      const expected = [...actual].sort();

      if (sortBy === SortType.nameZA) {
        expected.reverse();
      }

      expect(actual).toEqual(expected);
    });
  }
});

test("Verify user can filter products by category", async ({ app }) => {
  await app.homePage.goToHomePage();

  const randomCategory = random(app.homePage.allCategories);
  const categoryFilterLocator =
    app.homePage.getCategoryFilterLocator(randomCategory);
  await categoryFilterLocator.check();
  await app.homePage.getItemTitleLocator(randomCategory).first().waitFor();

  const productTitles = await app.homePage.getAllVisibleTitles();
  productTitles.forEach((title) =>
    expect(
      title,
      `Some product "${title}" does not belong to the selected category "${randomCategory}"`,
    ).toContain(randomCategory),
  );
});

test("Verify user can complete checkout with credit card", async ({
  loggedInApp,
}) => {
  await loggedInApp.homePage.goToHomePage();
  await loggedInApp.homePage.itemCardLocator.nth(0).click();

  const productTitle =
    await loggedInApp.productPage.itemTitleLocator.innerText();
  const productPriceText =
    await loggedInApp.productPage.itemPriceLocator.innerText();
  const productPrice = parseFloat(productPriceText.replace("$", ""));

  await loggedInApp.productPage.addToCartButtonLocator.click();
  await loggedInApp.productPage.header.cartIconLocator.click();
  await loggedInApp.checkoutPage.proceedCheckoutButton1Locator.waitFor();

  const productsInCart = await loggedInApp.checkoutPage.getProductsInCart();
  expect(productsInCart[0].name, "Product title in the cart is incorrect").toBe(
    productTitle,
  );
  expect(
    productsInCart[0].price,
    "Product price in the cart is incorrect",
  ).toBe(productPrice);
  await expect(
    loggedInApp.checkoutPage.cartTotalLocator,
    "Cart total is incorrect",
  ).toHaveText("$" + productPrice);

  await loggedInApp.checkoutPage.proceedCheckoutButton1Locator.click();
  await loggedInApp.checkoutPage.proceedCheckoutButton2Locator.click();

  await loggedInApp.checkoutPage.billingAddressFragment.stateLocator.fill(
    "California",
  );
  await loggedInApp.checkoutPage.billingAddressFragment.postalCodeLocator.fill(
    "90001",
  );
  await loggedInApp.checkoutPage.proceedCheckoutButton3Locator.click();

  await loggedInApp.checkoutPage.paymentFragment.paymentMethodDropdownLocator.selectOption(
    "credit-card",
  );
  await loggedInApp.checkoutPage.paymentFragment.creditCardNumber.fill(
    PaymentData.creditCardNumber,
  );

  await loggedInApp.checkoutPage.paymentFragment.creditCardExpiry.fill(
    PaymentData.creditCardExpiry,
  );
  await loggedInApp.checkoutPage.paymentFragment.creditCardCvv.fill(
    PaymentData.creditCardCvv,
  );
  await loggedInApp.checkoutPage.paymentFragment.cardHolderNameLocator.fill(
    PaymentData.cardHolderName,
  );
  await loggedInApp.checkoutPage.paymentFragment.confirmButtonLocator.click();
  await expect(
    loggedInApp.checkoutPage.paymentFragment.paymentSuccessMessage,
    "Payment success message is not visible",
  ).toBeVisible();
});

test("Verify 20 products are displayed per page by default", async ({
  app
}) => {

  await app.homePage.mockProducts(20);
  await app.homePage.goToHomePage();
  const productsCount = await app.homePage.itemCardLocator.count();
  expect(productsCount, "Number of products displayed is incorrect").toBe(20);
});
