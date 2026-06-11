import { expect, test } from "@playwright/test";
import { USER_STORAGE_STATE } from "./test-users";

test.use({ storageState: USER_STORAGE_STATE });

test.describe("ナビゲーション", () => {
  test("正常系: ナビのリンクから各ページへ移動でき、現在地のリンクが強調される", async ({
    page,
  }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation");

    await nav.getByRole("link", { name: "Todos" }).click();
    await expect(page).toHaveURL(/\/todos$/);
    await expect(nav.getByRole("link", { name: "Todos" })).toHaveClass(
      /font-semibold/
    );

    await nav.getByRole("link", { name: "Profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(nav.getByRole("link", { name: "Profile" })).toHaveClass(
      /font-semibold/
    );

    await nav.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(nav.getByRole("link", { name: "Home" })).toHaveClass(
      /font-semibold/
    );
  });

  test("正常系: モバイル表示ではハンバーガーメニューからページへ移動できる", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await page.getByRole("button", { name: "Toggle menu" }).click();

    const mobileTodosLink = page.getByRole("link", { name: "Todos" });
    await expect(mobileTodosLink).toBeVisible();
    await mobileTodosLink.click();

    await expect(page).toHaveURL(/\/todos$/);
    await expect(
      page.getByRole("heading", { name: "My Todos" })
    ).toBeVisible();
  });
});
