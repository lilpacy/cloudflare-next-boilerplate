import { expect, test } from "@playwright/test";
import { AdminPage } from "./pages/AdminPage";
import { ADMIN_STORAGE_STATE } from "./test-users";

test.use({ storageState: ADMIN_STORAGE_STATE });

test.describe("管理者ダッシュボード", () => {
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
