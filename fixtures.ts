import { test as base } from "@playwright/test";
import { App } from "./pages/app";
// import { testUser } from "./credinals.data";

// Declare the types of your fixtures.
type MyFixtures = {
  loggedInApp: App;
  app: App;
};



export const test = base.extend<MyFixtures>({
  loggedInApp: async ({browser }, use) => {
    // Set up the fixture.
    const context = await browser.newContext({
      storageState: "playwright/.auth/user.json",
    });
    const page = await context.newPage();
    const app = new App(page);

    // await page.goto("/auth/login");
    // await app.loginPage.performLogin(testUser.email, testUser.password);

    // Use the fixture value in the test.
    await use(app);

    // Clean up the fixture.
  },

  app: async ({ page }, use) => {
    const app = new App(page);
    await use(app);
  },
});
export { expect } from "@playwright/test";
