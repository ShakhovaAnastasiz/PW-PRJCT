import { Page, Locator } from "@playwright/test";
import { Header } from "./header.fragment";

export enum ProductNames {
  slipJointPliers = "Slip Joint Pliers",
  combinationPliers = "Combination Pliers",
}

export enum FiltersByCategoryHandTools {
  screwdriver = "Screwdriver",
}

export enum FiltersByCategoryPowerTools {
  sander = "Sander",
  drill = "Drill",
  saw = "Saw",
}

export enum FiltersByCategoryOther {}

export enum SortType {
  priceLowHigh = "Price (Low - High)",
  priceHighLow = "Price (High - Low)",
  nameAZ = "Name (A - Z)",
  nameZA = "Name (Z - A)",
}

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

  async goToHomePage() {
    await this.page.goto("/");
  }

  getItemTitleLocator(text?: string): Locator {
    if (text) {
      return this.itemTitleLocator.locator(`:scope`, { hasText: text });
    }
    return this.itemTitleLocator;
  }

  async clickOnProductCard(productName: string) {
    const productCard = this.itemCardLocator
      .filter({ hasText: productName })
      .first();
    await productCard.click();
  }

  getNavSignInLocator(): Locator {
    return this.header.getNavSignInLocator();
  }

  async getAllVisibleTitles(): Promise<string[]> {
    return await this.itemTitleLocator.allInnerTexts();
  }

  sortedByPrice = async (
    sortType: SortType.priceLowHigh | SortType.priceHighLow
  ): Promise<{ actualResult: number[]; expectedResult: number[] }> => {
    await this.sortSelectLocator.selectOption({ label: sortType });

    const priceStrings: string[] = await this.itemPriceLocator.allInnerTexts();
    const actualPrices: number[] = priceStrings.map((p) =>
      parseFloat(p.replace("$", ""))
    );

    const sortedPrices = [...actualPrices].sort((a, b) => a - b);

    if (sortType === SortType.priceHighLow) {
      sortedPrices.reverse();
    }

    return { actualResult: actualPrices, expectedResult: sortedPrices };
  };

  sortedByTitle = async (
    sortType: SortType.nameAZ | SortType.nameZA
  ): Promise<{
    actualResult: string[];
    expectedResult: string[];
  }> => {
    await this.sortSelectLocator.selectOption({ label: sortType });
    const listOfProductTitlesAfterSort: string[] =
      await this.getAllVisibleTitles();
    let sortedTitles: string[] = [...listOfProductTitlesAfterSort].sort();
    if (sortType === SortType.nameZA) {
      sortedTitles = sortedTitles.reverse();
    }

    return {
      actualResult: listOfProductTitlesAfterSort,
      expectedResult: sortedTitles,
    };
  };

  getCategoryFilterLocator(category: string): Locator {
    return this.page.locator(
      `label >> text="${category}" >> input[name="category_id"]`
    );
  }
}
