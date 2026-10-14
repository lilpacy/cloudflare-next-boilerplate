import type { Locator, Page } from "@playwright/test";

export class AdminPage {
  readonly heading: Locator;
  readonly totalLabel: Locator;
  readonly completedLabel: Locator;
  readonly pendingLabel: Locator;
  readonly totalCount: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Dashboard" });
    this.totalLabel = page.getByText("Total Todos");
    this.completedLabel = page.getByText("Completed");
    this.pendingLabel = page.getByText("Pending");
    this.totalCount = page
      .locator("div", { has: this.totalLabel })
      .locator("p")
      .last();
  }

  async open(): Promise<void> {
    await this.page.goto("/admin");
  }
}
