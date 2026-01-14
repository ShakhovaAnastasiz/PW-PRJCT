import { Page, Locator } from "@playwright/test";

export class PaymentFragment {
  readonly page: Page;
  readonly paymentMethodDropdownLocator: Locator;
  readonly creditCardNumber: Locator;
  readonly creditCardExpiry: Locator;
  readonly creditCardCvv: Locator;
  readonly cardHolderNameLocator: Locator;
  readonly confirmButtonLocator: Locator;
  readonly paymentSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.paymentMethodDropdownLocator = page.getByTestId("payment-method");
    this.creditCardNumber = page.getByTestId("credit_card_number");
    this.creditCardExpiry = page.getByTestId("expiration_date");
    this.creditCardCvv = page.getByTestId("cvv");
    this.cardHolderNameLocator = page.getByTestId("card_holder_name");
    this.confirmButtonLocator = page.getByTestId("finish");
    this.paymentSuccessMessage = page.getByTestId("payment-success-message");
  }
}
