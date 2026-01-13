import { Page, Locator } from "@playwright/test";
import { Header } from "./header.fragment";
import { FiltersByCategoryHandTools, FiltersByCategoryOther, FiltersByCategoryPowerTools } from "../testData/productNames";
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
    ...Object.values(FiltersByCategoryOther),
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

  async getAllVisibleTitles(): Promise<string[]> {
    return await this.itemTitleLocator.allInnerTexts();
  }

  async getPricesAfterSorting(
    sortType: SortType.priceLowHigh | SortType.priceHighLow
  ): Promise<number[]> {
    await this.sortSelectLocator.selectOption({ label: sortType });

    const priceStrings = await this.itemPriceLocator.allInnerTexts();
    return priceStrings.map((p) => parseFloat(p.replace("$", "")));
  }

  async getTitlesAfterSorting(
    sortType: SortType.nameAZ | SortType.nameZA
  ): Promise<string[]> {
    await this.sortSelectLocator.selectOption({ label: sortType });
    return this.getAllVisibleTitles();
  }

  getCategoryFilterLocator(category: string): Locator {
    return this.page.locator(
      `label >> text="${category}" >> input[name="category_id"]`
    );
  }
}
