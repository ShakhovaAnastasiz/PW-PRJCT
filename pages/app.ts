import { Page } from "@playwright/test";
import { LoginPage } from "./login.page";
import { HomePage } from "./home.page";
import { ProductPage } from "./product.page";
import { AccountPage } from "./account.page";
import { CheckoutPage } from "./checkout.page";


export class App {
    loginPage: LoginPage;
    homePage: HomePage;
    productPage: ProductPage;
    accountPage: AccountPage;
    checkoutPage: CheckoutPage;

    constructor(page: Page) {
        this.loginPage = new LoginPage(page);
        this.homePage = new HomePage(page);
        this.productPage = new ProductPage(page);
        this.accountPage = new AccountPage(page);
        this.checkoutPage = new CheckoutPage(page);
    }

}