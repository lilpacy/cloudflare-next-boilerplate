import path from "node:path";
import { expect } from "@playwright/test";
import { test } from "./fixtures/test";
import { ProfilePage } from "./pages/ProfilePage";

const AVATAR_PATH = path.join(__dirname, "fixtures", "avatar.png");

test.describe("プロフィール画像", () => {
  test("正常系: 画像を選択してアップロードすると現在の画像として表示される", async ({
    signedInPage: page,
  }) => {
    const profile = new ProfilePage(page);
    await profile.open();

    await profile.selectImage(AVATAR_PATH);
    await expect(profile.preview).toBeVisible();

    await profile.uploadImage();

    await expect(profile.currentImage).toBeVisible();
    await expect(profile.storedImage).toBeVisible();
  });

  test("正常系: アップロードした画像は画像 API からも取得できる", async ({
    profileImage: profile,
  }) => {
    await profile.open();

    const response = await profile.fetchStoredImage();

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
  });

  test("正常系: 削除を確定すると現在の画像が表示されなくなる", async ({
    profileImage: profile,
  }) => {
    await profile.open();

    await profile.deleteImage();

    await expect(profile.currentImage).not.toBeVisible();
    await expect(profile.deleteButton).not.toBeVisible();
  });
});
