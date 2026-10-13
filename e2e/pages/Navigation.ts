import type { Locator, Page } from "@playwright/test";

export class Navigation {
  constructor(private readonly page: Page) {}

  link(name: "Home" | "Todos" | "Profile"): Locator {
    // Desktop and mobile menus share labels; operate on the displayed menu.
    return this.page
      .getByRole("navigation")
      .getByRole("link", { name })
      .filter({ visible: true });
  }

  async goTo(name: "Home" | "Todos" | "Profile"): Promise<void> {
    await this.link(name).click();
  }

  async toggleMenu(): Promise<void> {
    await this.page.getByRole("button", { name: "Toggle menu" }).click();
  }
}
