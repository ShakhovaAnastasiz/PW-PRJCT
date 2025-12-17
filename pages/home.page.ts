import { Page, Locator } from '@playwright/test';
import { Header } from './header.fragment';

export class HomePage{
    readonly page: Page;
    readonly itemCardLocator: Locator;
    readonly header: Header;


    constructor(page: Page){
        this.page = page;
        this.itemCardLocator = page.locator('a.card');
        this.header = new Header(page);
    }

    async ClickOnProductCard(productName: string){
        const productCard = this.itemCardLocator.filter({ hasText: productName }).first();
        await productCard.click();
    }

    getNavSignInLocator(): Locator{ 
        return this.header.getNavSignInLocator();
    }
    
}
