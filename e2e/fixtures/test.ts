import { clerk } from "@clerk/testing/playwright";
import { expect, test as base, type Page } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import type { ProfilePage } from "../pages/ProfilePage";
import { TodosPage } from "../pages/TodosPage";
import { useCloudflareBindings, type TestBindings } from "./CloudflareBindings";
import { ProfileImageResource } from "./ProfileImageResource";
import { TodoResource, type TestTodo } from "./TodoResource";
import { UserResource, type TestUser } from "./UserResource";

type Fixtures = {
  user: TestUser;
  signedInPage: Page;
  todo: TestTodo;
  profileImage: ProfilePage;
};

export const test = base.extend<Fixtures, { bindings: TestBindings }>({
  bindings: [async ({}, use) => {
    await useCloudflareBindings(use);
  }, { scope: "worker" }],
  user: async ({ bindings }, use) => {
    await new UserResource(bindings).run(use);
  },
  signedInPage: async ({ page, user }, use) => {
    await new HomePage(page).open();
    await clerk.signIn({ page, emailAddress: user.email });
    const todos = new TodosPage(page);
    await todos.open();
    await expect(todos.heading).toBeVisible();
    await use(page);
  },
  todo: async ({ bindings, user, signedInPage }, use) => {
    await new TodoResource(bindings, user, signedInPage).run(use);
  },
  profileImage: async ({ bindings, user, signedInPage }, use) => {
    await new ProfileImageResource(bindings, user, signedInPage).run(use);
  },
});
