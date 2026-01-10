import { Page, Locator } from "@playwright/test";
import { Header } from "./header.fragment";

export class AccountPage {
  readonly page: Page;
  readonly pageTitleLocator: Locator;
  readonly header: Header;

  constructor(page: Page) {
    this.page = page;
    this.pageTitleLocator = page.getByTestId("page-title");
    this.header = new Header(page);
  }

}
