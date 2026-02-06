import { Page, Locator } from "@playwright/test";

export class BillingAddressFragment {
  readonly page: Page;
  readonly stateLocator: Locator;
  readonly postalCodeLocator: Locator;
  readonly countryLocator: Locator;
  readonly cityLocator: Locator;
  readonly streetLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.stateLocator = page.getByTestId("state");
    this.postalCodeLocator = page.getByTestId("postal_code");
    this.countryLocator = page.getByTestId("country");
    this.cityLocator = page.getByTestId("city");
    this.streetLocator = page.getByTestId("street");
  }
}
