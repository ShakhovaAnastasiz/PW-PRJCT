import { Page, Locator } from "@playwright/test";
import { Header } from "./header.fragment";
import { BillingAddressFragment } from "./billingAddress.fragment";
import { PaymentFragment } from "./payment.fragment";

type CartItem = {
  name: string;
  quantity: number;
  price: number;
  total: number;
};

export class CheckoutPage {
  readonly page: Page;
  readonly tableProductsInCartLocator: Locator;
  readonly proceedCheckoutButton1Locator: Locator;
  readonly proceedCheckoutButton2Locator: Locator;
  readonly proceedCheckoutButton3Locator: Locator;
  readonly cartTotalLocator: Locator;
  readonly header: Header;
  readonly billingAddressFragment: BillingAddressFragment;
  readonly paymentFragment: PaymentFragment;

  constructor(page: Page) {
    this.page = page;
    this.tableProductsInCartLocator = page.locator("table");
    this.proceedCheckoutButton1Locator = page.getByTestId("proceed-1");
    this.proceedCheckoutButton2Locator = page.getByTestId("proceed-2");
    this.proceedCheckoutButton3Locator = page.getByTestId("proceed-3");
    this.cartTotalLocator = page.getByTestId("cart-total");
    this.header = new Header(page);
    this.billingAddressFragment = new BillingAddressFragment(page);
    this.paymentFragment = new PaymentFragment(page);
  }

  async getProductsInCart(): Promise<CartItem[]> {
    const rows = this.tableProductsInCartLocator.locator("tbody tr");
    const itemCount = await rows.count();
    const products: CartItem[] = [];

    for (let i = 0; i < itemCount; i++) {
      const row = rows.nth(i);
      const itemText = await row.getByTestId("product-title").innerText();
      const quantityText = await row
        .getByTestId("product-quantity")
        .inputValue();
      const priceText = await row.getByTestId("product-price").innerText();
      const totalText = await row.getByTestId("line-price").innerText();

      const name = itemText.replace(/\s+/g, " ").trim();
      const quantity = parseInt(quantityText, 10);
      const price = parseFloat(priceText.replace("$", ""));
      const total = parseFloat(totalText.replace("$", ""));

      products.push({ name, quantity, price, total });
    }

    return products;
  }
}
