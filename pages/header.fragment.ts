import { Page, Locator } from '@playwright/test';

export class Header{
    readonly page: Page;
    readonly navMenuLocator: Locator;
    readonly navSignInLocator: Locator;
    constructor(page: Page){
        this.page = page;
        this.navMenuLocator = page.getByTestId('nav-menu');
        this.navSignInLocator = page.getByTestId('nav-sign-in');
    }
    getNavMenuLocator(): Locator{ 
        return this.navMenuLocator;
    }
    getNavSignInLocator(): Locator{ 
        return this.navSignInLocator;
    }
}