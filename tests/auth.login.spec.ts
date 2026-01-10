import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { testUser } from "../credinals.data";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

test("Login", async ({ page }) => {
  test.skip(
    !!process.env.CI,
    "Test is skipped in CI due to the Cloudflare protection."
  );
  const loginPage = new LoginPage(page);

  await page.goto("/auth/login");
  await loginPage.performLogin(testUser.email, testUser.password);
  await expect(page, "Incorrect URL").toHaveURL("/account");

  await page.context().storageState({ path: authFile });
});
