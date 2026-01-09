import { Page, Locator } from "@playwright/test";
import { Header } from "./header.fragment";

type CartItem = {
  name: string;
  quantity: number;
  price: number;
  total: number;
};

export class CheckoutPage {
  readonly page: Page;
  readonly tableProductsInCartLocator: Locator;
  readonly proceedCheckoutButtonLocator: Locator;
  readonly header: Header;

  constructor(page: Page) {
    this.page = page;
    this.tableProductsInCartLocator = page.locator("table");
    this.proceedCheckoutButtonLocator = page.getByTestId("proceed-1");
    this.header = new Header(page);
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
