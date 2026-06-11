import { expect, test } from "@playwright/test";
import { ADMIN_STORAGE_STATE } from "./test-users";

test.use({ storageState: ADMIN_STORAGE_STATE });

test.describe("管理者ダッシュボード", () => {
  test("正常系: 管理者がダッシュボードを開くと Todo の統計が表示される", async ({
    page,
  }) => {
    await page.goto("/admin");

    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Total Todos")).toBeVisible();
    await expect(page.getByText("Completed")).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();

    const total = page
      .locator("div", { has: page.getByText("Total Todos") })
      .locator("p");
    await expect(total.last()).toHaveText(/^\d+$/);
  });
});
