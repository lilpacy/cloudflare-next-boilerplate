import path from "node:path";
import { expect, test } from "@playwright/test";
import { USER_STORAGE_STATE } from "./test-users";

test.use({ storageState: USER_STORAGE_STATE });

test.describe.configure({ mode: "serial" });

const AVATAR_PATH = path.join(__dirname, "fixtures", "avatar.png");

test.describe("プロフィール画像", () => {
  test("正常系: 画像を選択してアップロードすると現在の画像として表示される", async ({
    page,
  }) => {
    await page.goto("/profile");

    await page.getByLabel("Upload new image").setInputFiles(AVATAR_PATH);
    await expect(page.getByText("Preview:")).toBeVisible();

    await page.getByRole("button", { name: "Upload Image" }).click();

    await expect(page.getByText("Current image:")).toBeVisible();
    await expect(page.getByText(/Image stored in R2: profiles\//)).toBeVisible();
  });

  test("正常系: アップロードした画像は画像 API からも取得できる", async ({
    page,
  }) => {
    await page.goto("/profile");

    const keyText = await page
      .getByText(/Image stored in R2: profiles\//)
      .textContent();
    const key = keyText!.replace("Image stored in R2: ", "").trim();

    const response = await page.request.get(`/api/images/${key}`);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
  });

  test("正常系: 削除を確定すると現在の画像が表示されなくなる", async ({
    page,
  }) => {
    await page.goto("/profile");

    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete Current Image" }).click();

    await expect(page.getByText("Current image:")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Delete Current Image" })
    ).not.toBeVisible();
  });
});
