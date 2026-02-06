import { Page, Locator } from "@playwright/test";
import { Header } from "./header.fragment";
import {
  FiltersByCategoryHandTools,
  FiltersByCategoryPowerTools,
} from "../testData/productNames";
import { SortType } from "../testData/sortTypes";
export class HomePage {
  readonly page: Page;
  readonly itemCardLocator: Locator;
  readonly itemPriceLocator: Locator;
  readonly sortSelectLocator: Locator;
  readonly itemTitleLocator: Locator;
  readonly header: Header;

  readonly allCategories = [
    ...Object.values(FiltersByCategoryPowerTools),
    ...Object.values(FiltersByCategoryHandTools),
  ];

  constructor(page: Page) {
    this.page = page;
    this.itemCardLocator = page.locator("a.card");
    this.itemPriceLocator = page.getByTestId("product-price");
    this.itemTitleLocator = page.getByTestId("product-name");
    this.sortSelectLocator = page.getByTestId("sort");
    this.header = new Header(page);
  }

  async goToHomePage(): Promise<void> {
    await this.page.goto("/");
  }

  getItemTitleLocator(text?: string): Locator {
    if (text) {
      return this.itemTitleLocator.locator(`:scope`, { hasText: text });
    }
    return this.itemTitleLocator;
  }

  async clickOnProductCard(productName: string): Promise<void> {
    const productCard = this.itemCardLocator
      .filter({ hasText: productName })
      .first();
    await productCard.click();
  }

  async sortByPrice(
    sortType: SortType.priceLowHigh | SortType.priceHighLow,
  ): Promise<void> {
    await this.sortSelectLocator.selectOption({ label: sortType });
  }
  async getItemPrices(): Promise<number[]> {
    const priceStrings = await this.itemPriceLocator.allInnerTexts();

    return priceStrings.map((p) => parseFloat(p.replace("$", "")));
  }

  async sortByName(sortType: SortType.nameAZ | SortType.nameZA): Promise<void> {
    await this.sortSelectLocator.selectOption({ label: sortType });
  }
  async getItemTitles(): Promise<string[]> {
    return await this.itemTitleLocator.allInnerTexts();
  }


  getCategoryFilterLocator(category: string): Locator {
    return this.page.locator(
      `label >> text="${category}" >> input[name="category_id"]`,
    );
  }
  async mockProducts(productAmount: number): Promise<void> {
    await this.page.route("**/products*", async (route) => {
      const products = Array.from({ length: productAmount }, (_, i) => ({
        id: i + 1,
        name: `Test product ${i + 1}`,
        price: 10 + i,
      }));

      await route.fulfill({
        json: {
          current_page: 1,
          data: products,
          from: 1,
          to: productAmount,
          per_page: productAmount,
          total: productAmount,
          last_page: 1,
        },
      });
    });
  }
}
