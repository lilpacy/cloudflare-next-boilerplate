import type { Locator, Page } from "@playwright/test";

export class EditTodoPage {
  readonly titleInput: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.getByLabel("Title");
  }

  async changeTitle(title: string): Promise<void> {
    await this.titleInput.fill(title);
  }

  async save(): Promise<void> {
    await this.page.getByRole("button", { name: "Save Changes" }).click();
  }

  async cancel(): Promise<void> {
    await this.page.getByRole("button", { name: "Cancel" }).click();
  }
}
