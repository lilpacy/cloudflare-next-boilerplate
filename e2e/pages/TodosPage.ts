import type { Locator, Page } from "@playwright/test";

export class TodosPage {
  // shortcut: edit/toggle/delete assume one Todo; scope by Todo identity when scenarios create several.
  readonly heading: Locator;
  readonly emptyMessage: Locator;
  readonly titleInput: Locator;
  readonly completionCheckbox: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "My Todos" });
    this.emptyMessage = page.getByText("No todos yet. Create your first todo above!");
    this.titleInput = page.getByLabel("Title");
    this.completionCheckbox = page.getByRole("checkbox");
  }

  async open(): Promise<void> {
    await this.page.goto("/todos");
  }

  title(title: string): Locator {
    return this.page.getByRole("heading", { name: title });
  }

  description(description: string): Locator {
    return this.page.getByText(description);
  }

  async create(title: string, description: string): Promise<void> {
    await this.titleInput.fill(title);
    await this.page.getByLabel("Description (optional)").fill(description);
    await this.page.getByRole("button", { name: "Create Todo" }).click();
  }

  async toggleCompleted(): Promise<void> {
    await this.completionCheckbox.click();
  }

  async edit(): Promise<void> {
    await this.page.getByRole("link", { name: "Edit" }).click();
  }

  async delete(): Promise<void> {
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.page.getByRole("button", { name: "Delete" }).click();
  }
}
