import { expect, test } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test.describe("ホームページ", () => {
  test("正常系: 訪問者がトップページを開くと機能紹介とデモへの導線が表示される", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.open();

    await expect(home.heading).toBeVisible();
    await expect(home.demoLink).toBeVisible();
    await expect(home.databaseHeading).toBeVisible();
    await expect(home.gettingStartedHeading).toBeVisible();
  });
});
