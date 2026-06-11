import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { E2E_USER_EMAIL } from "./test-users";

test.describe("認証", () => {
  test("正常系: サインインすると Todos ページを利用できる", async ({ page }) => {
    await page.goto("/");
    await clerk.signIn({ page, emailAddress: E2E_USER_EMAIL });

    await page.goto("/todos");

    await expect(
      page.getByRole("heading", { name: "My Todos" })
    ).toBeVisible();
  });

  test("正常系: サインアウトすると Todos ページはサインイン画面に切り替わる", async ({
    page,
  }) => {
    await page.goto("/");
    await clerk.signIn({ page, emailAddress: E2E_USER_EMAIL });
    await clerk.signOut({ page });

    await page.goto("/todos");

    await expect(page).toHaveURL(/sign-in/);
  });
});
