import { expect, test } from "@playwright/test";

test.describe("ホームページ", () => {
  test("正常系: 訪問者がトップページを開くと機能紹介とデモへの導線が表示される", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Cloudflare Next.js Boilerplate" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "View Demo App" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "D1 Database" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Getting Started" })
    ).toBeVisible();
  });
});
