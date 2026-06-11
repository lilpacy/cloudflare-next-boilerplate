import { expect, test } from "@playwright/test";
import { USER_STORAGE_STATE } from "./test-users";

test.use({ storageState: USER_STORAGE_STATE });

test.describe.configure({ mode: "serial" });

test.describe("Todo 管理", () => {
  const todoTitle = `E2E Todo ${Date.now()}`;
  const todoDescription = "E2E テスト用の説明";
  const updatedTitle = `${todoTitle} (updated)`;

  test("正常系: Todo がないときは空状態のメッセージが表示される", async ({
    page,
  }) => {
    await page.goto("/todos");

    await expect(
      page.getByText("No todos yet. Create your first todo above!")
    ).toBeVisible();
  });

  test("正常系: タイトルと説明を入力すると Todo が一覧に追加される", async ({
    page,
  }) => {
    await page.goto("/todos");

    await page.getByLabel("Title").fill(todoTitle);
    await page.getByLabel("Description (optional)").fill(todoDescription);
    await page.getByRole("button", { name: "Create Todo" }).click();

    await expect(
      page.getByRole("heading", { name: todoTitle })
    ).toBeVisible();
    await expect(page.getByText(todoDescription)).toBeVisible();
    await expect(page.getByLabel("Title")).toHaveValue("");
  });

  test("正常系: チェックボックスを押すと Todo が完了として表示される", async ({
    page,
  }) => {
    await page.goto("/todos");

    await page.getByRole("checkbox").click();

    await expect(page.getByRole("checkbox")).toBeChecked();
    await expect(page.getByRole("heading", { name: todoTitle })).toHaveClass(
      /line-through/
    );
  });

  test("正常系: 編集画面で保存すると変更が一覧に反映される", async ({
    page,
  }) => {
    await page.goto("/todos");

    await page.getByRole("link", { name: "Edit" }).click();
    await expect(page.getByLabel("Title")).toHaveValue(todoTitle);

    await page.getByLabel("Title").fill(updatedTitle);
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL(/\/todos$/);
    await expect(
      page.getByRole("heading", { name: updatedTitle })
    ).toBeVisible();
  });

  test("正常系: 編集画面でキャンセルすると変更せずに一覧へ戻る", async ({
    page,
  }) => {
    await page.goto("/todos");

    await page.getByRole("link", { name: "Edit" }).click();
    await page.getByLabel("Title").fill("破棄されるタイトル");
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL(/\/todos$/);
    await expect(
      page.getByRole("heading", { name: updatedTitle })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "破棄されるタイトル" })
    ).not.toBeVisible();
  });

  test("正常系: 削除を確定すると Todo が一覧から消える", async ({ page }) => {
    await page.goto("/todos");

    page.on("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).click();

    await expect(
      page.getByText("No todos yet. Create your first todo above!")
    ).toBeVisible();
  });
});
