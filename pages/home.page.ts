import { Page, Locator } from '@playwright/test';
import { Header } from './header.fragment';

export enum ProductNames {
    'Slip Joint Pliers' = 'Slip Joint Pliers',
    'Combination Pliers' = 'Combination Pliers',
}

export enum FiltersByCategoryHandTools{
    'Hammer' = 'Hammer',
    'Pliers' = 'Pliers',
}

export enum FiltersByCategoryPowerTools{
    'Sander' = 'Sander',
    'Drill' = 'Drill',
}

export enum FiltersByCategoryOther{}

export class HomePage{

    
    readonly page: Page;
    readonly itemCardLocator: Locator;
    readonly itemPriceLocator: Locator;
    readonly sortSelectLocator: Locator;
    readonly itemTitleLocator: Locator;
    readonly header: Header;

    readonly allCategories = [
        ...Object.values(FiltersByCategoryPowerTools),
        ...Object.values(FiltersByCategoryHandTools),
        ...Object.values(FiltersByCategoryOther)
    ];    

    constructor(page: Page){
        this.page = page;
        this.itemCardLocator = page.locator('a.card');
        this.itemPriceLocator = page.getByTestId('product-price');
        this.itemTitleLocator = page.getByTestId('product-name');
        this.sortSelectLocator = page.getByTestId('sort');
        this.header = new Header(page);
    }

    async goToHomePage(){
        await this.page.goto('/');
    }

    async clickOnProductCard(productName: string){
        const productCard = this.itemCardLocator.filter({ hasText: productName }).first();
        await productCard.click();
    }

    getNavSignInLocator(): Locator{ 
        return this.header.getNavSignInLocator();
    }

    async getAllVisibleTitles(): Promise<string[]> {
        return await this.itemTitleLocator.allInnerTexts();
    }

    async SortedByPrice(sortType: 'Price (Low - High)' | 'Price (High - Low)'): Promise<[number[], number[]]> {
        await this.sortSelectLocator.selectOption({ label: sortType });

        const priceStrings: string[] = await this.itemPriceLocator.allInnerTexts();
        const actualPrices: number[] = priceStrings.map(p => parseFloat(p.replace('$', '')));

        const sortedPrices = [...actualPrices].sort((a, b) => a - b);

        if (sortType === 'Price (High - Low)') {
            sortedPrices.reverse();
        }

        return [actualPrices, sortedPrices];
    }

    async SortedByTitle(sortType: 'Name (A - Z)' | 'Name (Z - A)'): Promise<[string[], string[]]> {
        await this.sortSelectLocator.selectOption({ label: sortType });
        const listOfProductTitlesAfterSort: string[] = await this.getAllVisibleTitles();
        let sortedTitles: string[] = [...listOfProductTitlesAfterSort].sort();
        if (sortType === 'Name (Z - A)') {
            sortedTitles = sortedTitles.reverse();
        }

        return [listOfProductTitlesAfterSort, sortedTitles];
}

    getCategoryFilterLocator(category: string): Locator {
        return this.page.locator(`label:has-text("${category}") input[name="category_id"]`);
    }

    getRandomCategory(): string {
        return this.allCategories[Math.floor(Math.random() * this.allCategories.length)];
    }

}
