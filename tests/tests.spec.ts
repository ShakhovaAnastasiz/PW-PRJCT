import { expect } from "@playwright/test";
import { random } from "../utils/utils";
import { test } from "../fixtures";
import { ProductNames } from "../testData/productNames";
import { SortType } from "../testData/sortTypes";
import { PaymentData } from "../testData/paymentData";
import { billingAddressData } from "../testData/billingAdressData";

const authFile = "playwright/.auth/user.json";

test.describe("Authenticated user tests", { tag: "@manual" }, () => {
  test.skip(
    !!process.env.CI,
    "Test is skipped in CI due to the Cloudflare protection.",
  );
  test.use({ storageState: authFile });
  test("Login", async ({ page, app }) => {
    await test.step("Navigate to account page", async () => {
      await page.goto("/account");
    });

    await test.step("Verify account page title is visible", async () => {
      await expect(
        app.accountPage.pageTitleLocator,
        "Page title wasn't found",
      ).toHaveText("My account");
    });

    await test.step("Verify username in header navigation", async () => {
      await expect(
        app.accountPage.header.navMenuLocator,
        "Username is incorrect",
      ).toContainText("Jane Doe");
    });
  });
});

test(
  "Verify unauthorized user can view product details",
  { tag: "@regression" },
  async ({ page, app }) => {
    const productName = ProductNames.combinationPliers;

    await test.step("Navigate to home and open product", async () => {
      await app.homePage.goToHomePage();
      await app.homePage.clickOnProductCard(productName);
    });

    await test.step("Verify URL is product page", async () => {
      await expect(page, "Incorrect URL").toHaveURL(/\/product\/.+/);
    });

    await test.step("Verify product details and UI elements", async () => {
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
        app.productPage.header.navSignInLocator,
        "Header doesn't contain sign in button",
      ).toContainText("Sign in");
    });
  },
);

test(
  "Verify user can add product to cart",
  { tag: ["@regression", "@smoke"] },
  async ({ app }) => {
    const productName = ProductNames.slipJointPliers;

    await test.step("Navigate to home and open product card", async () => {
      await app.homePage.goToHomePage();
      await app.homePage.clickOnProductCard(productName);
    });

    await test.step("Verify product title and price", async () => {
      await expect(
        app.productPage.itemTitleLocator,
        "Product name is incorrect",
      ).toHaveText(productName);
      await expect(
        app.productPage.itemPriceLocator,
        "Product price is incorrect",
      ).toHaveText("9.17");
    });

    await test.step("Add product to cart", async () => {
      await app.productPage.addToCartButtonLocator.click();
    });

    await test.step("Verify alert text and visibility/timeouts", async () => {
      await expect(
        app.productPage.alertProductAddedToCartLocator,
        "Alert message text is incorrect",
      ).toHaveText("Product added to shopping cart.");
      await expect(
        app.productPage.alertProductAddedToCartLocator,
        "Alert message is not visible",
      ).toBeVisible();
      await expect(
        app.productPage.alertProductAddedToCartLocator,
        "Alert message is not visible after 7s",
      ).toBeVisible({ timeout: 7_000 });
      await expect(
        app.productPage.alertProductAddedToCartLocator,
        "Alert message didn't disappear",
      ).toBeHidden({ timeout: 10_000 });
    });

    await test.step("Verify cart quantity in header", async () => {
      await expect(
        app.productPage.header.cartQuantityLocator,
        "Cart quantity is incorrect",
      ).toHaveText("1");
    });

    await test.step("Open cart and verify cart contents", async () => {
      await app.productPage.header.cartIconLocator.click();
      await app.checkoutPage.proceedCheckoutButton1Locator.waitFor();
      const productsInCart = await app.checkoutPage.getProductsInCart();

      expect(
        productsInCart.length,
        "Number of products in the cart is incorrect",
      ).toBe(1);
      expect(
        productsInCart[0].name,
        "Product title in the cart is incorrect",
      ).toBe(productName);

      await expect(
        app.checkoutPage.proceedCheckoutButton1Locator,
        '"Proceed to Checkout" button is not visible',
      ).toBeVisible();
    });
  },
);

test.describe("Sorting", { tag: "@regression" }, () => {
  const priceSortTypes = [
    SortType.priceHighLow,
    SortType.priceLowHigh,
  ] as const;

  for (const sortBy of priceSortTypes) {
    test(`Verify user can perform sorting by price: ${sortBy}`, async ({
      app,
    }) => {
      await test.step("Navigate to home page", async () => {
        await app.homePage.goToHomePage();
      });

      await test.step(`Sort items by price: ${sortBy}`, async () => {
        await app.homePage.sortByPrice(sortBy);
      });

      await test.step("Verify prices are sorted correctly", async () => {
        await expect
          .poll(
            async () => {
              const prices = await app.homePage.getItemPrices();

              const expected = [...prices].sort((a, b) =>
                sortBy === SortType.priceLowHigh ? a - b : b - a,
              );

              return prices.every((price, index) => price === expected[index]);
            },
            { timeout: 30_000 },
          )
          .toBe(true);
      });
    });
  }

  const nameSortTypes = [SortType.nameAZ, SortType.nameZA] as const;

  for (const sortBy of nameSortTypes) {
    test(`Verify user can perform sorting by name: ${sortBy}`, async ({
      app,
    }) => {
      await test.step("Navigate to home page", async () => {
        await app.homePage.goToHomePage();
      });

      await test.step(`Sort items by name: ${sortBy}`, async () => {
        await app.homePage.sortByName(sortBy);
      });

      await test.step("Verify names are sorted correctly", async () => {
        await expect
          .poll(
            async () => {
              const titles = await app.homePage.getItemTitles();

              const expected = [...titles].sort((a, b) =>
                sortBy === SortType.nameAZ
                  ? a.localeCompare(b)
                  : b.localeCompare(a),
              );

              return titles.every((title, index) => title === expected[index]);
            },
            { timeout: 30_000 },
          )
          .toBe(true);
      });
    });
  }
});

test(
  "Verify user can filter products by category",
  { tag: ["@regression", "@smoke"] },
  async ({ app }) => {
    let randomCategory: string;

    await test.step("Navigate to home page", async () => {
      await app.homePage.goToHomePage();
    });

    await test.step("Select a random category filter and wait for results", async () => {
      randomCategory = random(app.homePage.allCategories);
      const categoryFilterLocator =
        app.homePage.getCategoryFilterLocator(randomCategory);
      await categoryFilterLocator.check();
      await app.homePage.getItemTitleLocator(randomCategory).first().waitFor();
    });

    await test.step("Verify filtered products belong to the selected category", async () => {
      const productTitles = await app.homePage.getItemTitles();
      productTitles.forEach((title) =>
        expect(
          title,
          `Some product "${title}" does not belong to the selected category "${randomCategory}"`,
        ).toContain(randomCategory),
      );
    });
  },
);

test(
  "Verify user can complete checkout with credit card",
  { tag: "@regression" },
  async ({ loggedInApp }) => {
    await test.step("Navigate to home and open first product", async () => {
      await loggedInApp.homePage.goToHomePage();
      await loggedInApp.homePage.itemCardLocator.nth(0).click();
    });

    let productTitle: string;
    let productPrice: number;

    await test.step("Capture product title and price", async () => {
      productTitle = await loggedInApp.productPage.itemTitleLocator.innerText();
      const productPriceText =
        await loggedInApp.productPage.itemPriceLocator.innerText();
      productPrice = parseFloat(productPriceText.replace("$", ""));
    });

    await test.step("Add product to cart and open cart", async () => {
      await loggedInApp.productPage.addToCartButtonLocator.click();
      await loggedInApp.productPage.header.cartIconLocator.click();
      await loggedInApp.checkoutPage.proceedCheckoutButton1Locator.waitFor();
    });

    await test.step("Verify cart contents and total", async () => {
      const productsInCart = await loggedInApp.checkoutPage.getProductsInCart();
      expect(
        productsInCart[0].name,
        "Product title in the cart is incorrect",
      ).toBe(productTitle);
      expect(
        productsInCart[0].price,
        "Product price in the cart is incorrect",
      ).toBe(productPrice);
      await expect(
        loggedInApp.checkoutPage.cartTotalLocator,
        "Cart total is incorrect",
      ).toHaveText("$" + productPrice);
    });

    await test.step("Proceed to checkout steps 1 and 2", async () => {
      await loggedInApp.checkoutPage.proceedCheckoutButton1Locator.click();
      await loggedInApp.checkoutPage.proceedCheckoutButton2Locator.click();
    });

    await test.step("Fill billing address and continue", async () => {
      await loggedInApp.checkoutPage.billingAddressFragment.stateLocator.fill(
        billingAddressData.state,
      );
      await loggedInApp.checkoutPage.billingAddressFragment.postalCodeLocator.fill(
        billingAddressData.postalCode,
      );
      await loggedInApp.checkoutPage.billingAddressFragment.countryLocator.fill(
        billingAddressData.country,
      );
      await loggedInApp.checkoutPage.billingAddressFragment.cityLocator.fill(
        billingAddressData.city,
      );
      await loggedInApp.checkoutPage.billingAddressFragment.streetLocator.fill(
        billingAddressData.street,
      );
      await loggedInApp.checkoutPage.proceedCheckoutButton3Locator.click();
    });

    await test.step("Select credit card and fill payment details", async () => {
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
    });

    await test.step("Verify payment success message is visible", async () => {
      await expect(
        loggedInApp.checkoutPage.paymentFragment.paymentSuccessMessage,
        "Payment success message is not visible",
      ).toBeVisible();
    });
  },
);

test(
  "Verify 20 products are displayed per page by default",
  { tag: "@regression" },
  async ({ app }) => {
    await test.step("Mocking 20 products", async () => {
      await app.homePage.mockProducts(20);
    });
    await test.step("Navigating to home page", async () => {
      await app.homePage.goToHomePage();
    });

    await test.step("Verifying 20 products are displayed", async () => {
      await expect
        .poll(
          async () => {
            const count = await app.homePage.itemCardLocator.count();
            return count;
          },
          { timeout: 10000 },
        )
        .toBe(20);
    });
  },
);
