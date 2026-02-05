import { expect } from "@playwright/test";
import { testUser } from "../credinals.data";
import path from "path";
import { test } from "../fixtures";
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

test("Login", async ({ app, page }) => {
  test.skip(
    !!process.env.CI,
    "Test is skipped in CI due to the Cloudflare protection.",
  );
  await test.step("Navigate to account page", async () => {
    await page.goto("/account");
  });

  await test.step("Perform login", async () => {
    await app.loginPage.performLogin(testUser.email, testUser.password);
  });

  await test.step("Verify account page title is visible and username is correct", async () => {
    await expect(
      app.accountPage.pageTitleLocator,
      "Page title wasn't found",
    ).toHaveText("My account");
  });
  await expect(
    app.accountPage.header.navMenuLocator,
    "Username is incorrect",
  ).toContainText("Jane Doe");

  await page.context().storageState({ path: authFile });
});
