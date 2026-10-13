import { expect } from "@playwright/test";
import { test } from "./fixtures/test";
import { HomePage } from "./pages/HomePage";
import { Navigation } from "./pages/Navigation";
import { TodosPage } from "./pages/TodosPage";

test.describe("ナビゲーション", () => {
  test("正常系: ナビのリンクから各ページへ移動でき、現在地のリンクが強調される", async ({
    signedInPage: page,
  }) => {
    await new HomePage(page).open();

    const nav = new Navigation(page);

    await nav.goTo("Todos");
    await expect(page).toHaveURL(/\/todos$/);
    await expect(nav.link("Todos")).toHaveClass(/font-semibold/);

    await nav.goTo("Profile");
    await expect(page).toHaveURL(/\/profile$/);
    await expect(nav.link("Profile")).toHaveClass(/font-semibold/);

    await nav.goTo("Home");
    await expect(page).toHaveURL(/\/$/);
    await expect(nav.link("Home")).toHaveClass(/font-semibold/);
  });

  test("正常系: モバイル表示ではハンバーガーメニューからページへ移動できる", async ({
    signedInPage: page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await new HomePage(page).open();

    const nav = new Navigation(page);
    await nav.toggleMenu();

    await expect(nav.link("Todos")).toBeVisible();
    await nav.goTo("Todos");

    await expect(page).toHaveURL(/\/todos$/);
    await expect(new TodosPage(page).heading).toBeVisible();
  });
});
