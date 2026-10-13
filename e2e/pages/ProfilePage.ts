import type { APIResponse, Locator, Page } from "@playwright/test";

export class ProfilePage {
  readonly preview: Locator;
  readonly currentImage: Locator;
  readonly storedImage: Locator;
  readonly deleteButton: Locator;

  constructor(private readonly page: Page) {
    this.preview = page.getByText("Preview:");
    this.currentImage = page.getByText("Current image:");
    this.storedImage = page.getByText(/Image stored in R2: profiles\//);
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

  async fetchStoredImage(): Promise<APIResponse> {
    const keyText = await this.storedImage.textContent();
    const key = keyText!.replace("Image stored in R2: ", "").trim();
    return this.page.request.get(`/api/images/${key}`);
  }

  async deleteImage(): Promise<void> {
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.deleteButton.click();
  }
}
