import { Page, Locator } from '@playwright/test';
import { Header } from './header.fragment';

type CartItem = {
  item: string;
  quantity: number;
  price: number;
  total: number;
};

export class CheckoutPage{
    readonly page: Page;
    readonly TableProductsInCartLocator: Locator;
    readonly ProceedCheckoutButtonLocator: Locator;
    readonly header: Header;

    constructor(page: Page){
        this.page = page;
        this.TableProductsInCartLocator = page.locator('table');
        this.ProceedCheckoutButtonLocator = page.getByTestId('proceed-1');
        this.header = new Header(page);
    }

    getProceedCheckoutButtonLocator(): Locator{ 
        return this.ProceedCheckoutButtonLocator;
    }

    async getProductsInCart():  Promise<CartItem[]> {
        const rows = this.TableProductsInCartLocator.locator('tbody tr');
        const itemCount = await rows.count();
        const products: CartItem[] = [];

        for (let i = 0; i < itemCount; i++) {
            const row = rows.nth(i);
            const itemText = await row.locator('td').nth(0).innerText();
            const quantityText = await row.locator('td').nth(1).locator('input').inputValue();
            const priceText = await row.locator('td').nth(2).innerText();
            const totalText = await row.locator('td').nth(3).innerText();

            const item = itemText
            .replace(/\s+/g, ' ')
            .trim();
            const quantity = parseInt(quantityText, 10);
            const price = parseFloat(priceText.replace('$', ''));
            const total = parseFloat(totalText.replace('$', ''));

            products.push({ item, quantity, price, total });
        }

        return products;            
    }
}