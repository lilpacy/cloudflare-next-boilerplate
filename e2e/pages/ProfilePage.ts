import type { APIResponse, Locator, Page } from "@playwright/test";

export class ProfilePage {
  readonly preview: Locator;
  readonly currentImage: Locator;
  readonly profileImage: Locator;
  readonly deleteButton: Locator;

  constructor(private readonly page: Page) {
    this.preview = page.getByText("Preview:");
    this.currentImage = page.getByText("Current image:");
    this.profileImage = page.getByRole("img", { name: "Profile" });
    this.deleteButton = page.getByRole("button", { name: "Delete Current Image" });
  }

  async open(): Promise<void> {
    await this.page.goto("/profile");
  }

  async selectImage(filePath: string): Promise<void> {
    await this.page.getByLabel("Upload new image").setInputFiles(filePath);
  }

  async uploadImage(): Promise<void> {
    await this.page.getByRole("button", { name: "Upload Image" }).click();
  }

  async fetchProfileImage(): Promise<APIResponse> {
    const src = await this.profileImage.getAttribute("src");
    if (!src) throw new Error("Profile image has no src");
    return this.page.request.get(src);
  }

  async deleteImage(): Promise<void> {
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.deleteButton.click();
  }
}
