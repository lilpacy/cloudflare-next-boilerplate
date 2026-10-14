import type { Locator, Page } from "@playwright/test";

export class HomePage {
  readonly heading: Locator;
  readonly demoLink: Locator;
  readonly databaseHeading: Locator;
  readonly gettingStartedHeading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole("heading", {
      name: "Cloudflare Next.js Boilerplate",
    });
    this.demoLink = page.getByRole("link", { name: "View Demo App" });
    this.databaseHeading = page.getByRole("heading", { name: "D1 Database" });
    this.gettingStartedHeading = page.getByRole("heading", {
      name: "Getting Started",
    });
  }

  async open(): Promise<void> {
    await this.page.goto("/");
  }
}
