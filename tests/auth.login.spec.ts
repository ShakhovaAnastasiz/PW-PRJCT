import {expect } from "@playwright/test";
import { testUser } from "../credinals.data";
import path from "path";
import { test } from "../fixtures";
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

test("Login", async ({ app , page}) => {
  // const loginPage = new LoginPage(page);

  await page.goto("/auth/login");
  await app.loginPage.performLogin(testUser.email, testUser.password);
  await expect(page, "Incorrect URL").toHaveURL("/account");
  await expect(
    app.accountPage.pageTitleLocator,
    "Page title wasn't found",
  ).toHaveText("My account");
  await expect(
    app.accountPage.header.navMenuLocator,
    "Username is incorrect",
  ).toContainText("Jane Doe");

  await page.context().storageState({ path: authFile });
});
