import { clerk } from "@clerk/testing/playwright";
import { expect } from "@playwright/test";
import { test } from "./fixtures/test";
import { HomePage } from "./pages/HomePage";
import { TodosPage } from "./pages/TodosPage";

test.describe("認証", () => {
  test("正常系: サインインすると Todos ページを利用できる", async ({ page, user }) => {
    await new HomePage(page).open();
    await clerk.signIn({ page, emailAddress: user.email });

    const todos = new TodosPage(page);
    await todos.open();

    await expect(todos.heading).toBeVisible();
  });

  test("正常系: サインアウトすると Todos ページはサインイン画面に切り替わる", async ({
    page,
    user,
  }) => {
    await new HomePage(page).open();
    await clerk.signIn({ page, emailAddress: user.email });
    await clerk.signOut({ page });

    await new TodosPage(page).open();

    await expect(page).toHaveURL(/sign-in/);
  });
});
