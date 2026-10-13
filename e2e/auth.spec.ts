import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { TodosPage } from "./pages/TodosPage";
import { E2E_USER_EMAIL } from "./test-users";

test.describe("認証", () => {
  test("正常系: サインインすると Todos ページを利用できる", async ({ page }) => {
    await new HomePage(page).open();
    await clerk.signIn({ page, emailAddress: E2E_USER_EMAIL });

    const todos = new TodosPage(page);
    await todos.open();

    await expect(todos.heading).toBeVisible();
  });

  test("正常系: サインアウトすると Todos ページはサインイン画面に切り替わる", async ({
    page,
  }) => {
    await new HomePage(page).open();
    await clerk.signIn({ page, emailAddress: E2E_USER_EMAIL });
    await clerk.signOut({ page });

    await new TodosPage(page).open();

    await expect(page).toHaveURL(/sign-in/);
  });
});
