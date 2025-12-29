import { Page, Locator } from '@playwright/test';
import { Header } from './header.fragment';

export class ProductPage{
    readonly page: Page;
    readonly itemTitleLocator: Locator;
    readonly itemPriceLocator: Locator;
    readonly addToCartButtonLocator: Locator;
    readonly addToFavoritesButtonLocator: Locator;
    readonly alertProductAddedToCartLocator: Locator;

    readonly header: Header;

    constructor(page: Page){
        this.page = page;
        this.itemTitleLocator = page.getByTestId('product-name');
        this.itemPriceLocator = page.getByTestId('unit-price');
        this.addToCartButtonLocator = page.getByTestId('add-to-cart');
        this.addToFavoritesButtonLocator = page.getByTestId('add-to-favorites');
        this.alertProductAddedToCartLocator = page.getByRole('alert');
        this.header = new Header(page);
    }
        getTitleLocator(): Locator{ 
        return this.itemTitleLocator;
    }

    getPriceLocator(): Locator{ 
        return this.itemPriceLocator;
    }

    getAddToCartButtonLocator(): Locator{ 
        return this.addToCartButtonLocator;
    }

    getAddToFavoritesButtonLocator(): Locator{ 
        return this.addToFavoritesButtonLocator;
    }

    getNavSignInLocator(): Locator{ 
        return this.header.getNavSignInLocator();
    }

    getAlertProductAddedToCartLocator(): Locator{ 
        return this.alertProductAddedToCartLocator;
    }   
}
        