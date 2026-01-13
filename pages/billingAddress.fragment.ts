import { Page, Locator } from "@playwright/test";

export class BillingAddressFragment {
  readonly page: Page;
  readonly stateLocator: Locator;
  readonly postalCodeLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.stateLocator = page.getByTestId("state");
    this.postalCodeLocator = page.getByTestId("postal_code");
  }
}
