import { join } from "node:path";
import { expect, type Page } from "@playwright/test";
import { ProfilePage } from "../pages/ProfilePage";
import type { TestBindings } from "./CloudflareBindings";
import { ResourceFixture } from "./ResourceFixture";
import { deleteProfileImages, type TestUser } from "./UserResource";

export class ProfileImageResource extends ResourceFixture<ProfilePage> {
  constructor(
    private readonly bindings: TestBindings,
    private readonly user: TestUser,
    private readonly page: Page
  ) {
    super();
  }

  protected async create(): Promise<ProfilePage> {
    const profile = new ProfilePage(this.page);
    await profile.open();
    await profile.selectImage(join(__dirname, "avatar.png"));
    await profile.uploadImage();
    return profile;
  }

  protected async precheck(profile: ProfilePage): Promise<void> {
    await expect(profile.currentImage).toBeVisible();
    await expect(profile.profileImage).toBeVisible();
  }

  protected async cleanup(): Promise<void> {
    await deleteProfileImages(this.bindings, this.user.id);
    await this.bindings.DB.prepare("DELETE FROM users WHERE user_id = ?")
      .bind(this.user.id).run();
  }
}
