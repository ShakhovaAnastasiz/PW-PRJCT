import { Page, Locator } from "@playwright/test";

export class Header {
  readonly page: Page;
  readonly navMenuLocator: Locator;
  readonly navSignInLocator: Locator;
  readonly cartQuantityLocator: Locator;
  readonly cartIconLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navMenuLocator = page.getByTestId("nav-menu");
    this.navSignInLocator = page.getByTestId("nav-sign-in");
    this.cartQuantityLocator = page.getByTestId("cart-quantity");
    this.cartIconLocator = page.getByTestId("nav-cart");
  }
}
