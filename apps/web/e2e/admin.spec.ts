import { expect } from "@playwright/test";
import { test } from "./fixtures/test";
import { AdminPage } from "./pages/AdminPage";
import { ADMIN_STORAGE_STATE } from "./test-users";

test.describe("管理者ダッシュボード", () => {
  test.describe("管理者", () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    test("正常系: 管理者がダッシュボードを開くと Todo の統計が表示される", async ({
      page,
    }) => {
      const admin = new AdminPage(page);
      await admin.open();

      await expect(admin.heading).toBeVisible();
      await expect(admin.totalLabel).toBeVisible();
      await expect(admin.completedLabel).toBeVisible();
      await expect(admin.pendingLabel).toBeVisible();

      await expect(admin.totalCount).toHaveText(/^\d+$/);
    });
  });

  test("異常系: 管理者でないユーザーがダッシュボードを開くとトップページへ戻される", async ({
    signedInPage: page,
  }) => {
    await new AdminPage(page).open();

    await expect(page).toHaveURL(/\/$/);
  });

  test("異常系: 未ログインでダッシュボードを開くとサインイン画面へ送られる", async ({
    page,
  }) => {
    await new AdminPage(page).open();

    await expect(page).toHaveURL(/sign-in/);
  });
});
