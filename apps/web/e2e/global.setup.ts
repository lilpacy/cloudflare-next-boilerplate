import { execSync } from "node:child_process";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { TodosPage } from "./pages/TodosPage";
import { ADMIN_STORAGE_STATE, E2E_ADMIN_EMAIL } from "./test-users";

setup("Clerk と D1 を初期化し、テストユーザーでサインインする", async ({ browser }) => {
  if (!process.env.CLERK_SECRET_KEY?.startsWith("sk_test_")) {
    throw new Error("E2E requires a Clerk test secret key");
  }
  await clerkSetup();

  const migrate = process.env.E2E_ENV === "preview" ? "db:migrate:preview" : "db:migrate:local";

  execSync(`pnpm run ${migrate}`, { stdio: "inherit" });
  await ensureClerkUser(E2E_ADMIN_EMAIL);

  await saveSignedInState(browser, E2E_ADMIN_EMAIL, ADMIN_STORAGE_STATE);
});

async function ensureClerkUser(email: string) {
  const res = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [email],
      password: `e2e-${crypto.randomUUID()}`,
    }),
  });

  if (res.ok) return;

  const body = (await res.json()) as {
    errors?: { code?: string }[];
  };
  const alreadyExists = body.errors?.some(
    (e) => e.code === "form_identifier_exists"
  );
  if (alreadyExists) return;

  throw new Error(`Failed to create Clerk test user ${email}: ${JSON.stringify(body)}`);
}

async function saveSignedInState(
  browser: import("@playwright/test").Browser,
  email: string,
  storageStatePath: string
) {
  const context = await browser.newContext();
  const page = await context.newPage();

  await new HomePage(page).open();
  await clerk.signIn({ page, emailAddress: email });
  const todos = new TodosPage(page);
  await todos.open();
  await todos.heading.waitFor();

  await context.storageState({ path: storageStatePath });
  await context.close();
}
