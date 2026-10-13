import { expect, test } from "@playwright/test";
import { EditTodoPage } from "./pages/EditTodoPage";
import { TodosPage } from "./pages/TodosPage";
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
    const todos = new TodosPage(page);
    await todos.open();

    await expect(todos.emptyMessage).toBeVisible();
  });

  test("正常系: タイトルと説明を入力すると Todo が一覧に追加される", async ({
    page,
  }) => {
    const todos = new TodosPage(page);
    await todos.open();

    await todos.create(todoTitle, todoDescription);

    await expect(todos.title(todoTitle)).toBeVisible();
    await expect(todos.description(todoDescription)).toBeVisible();
    await expect(todos.titleInput).toHaveValue("");
  });

  test("正常系: チェックボックスを押すと Todo が完了として表示される", async ({
    page,
  }) => {
    const todos = new TodosPage(page);
    await todos.open();

    await todos.toggleCompleted();

    await expect(todos.completionCheckbox).toBeChecked();
    await expect(todos.title(todoTitle)).toHaveClass(/line-through/);
  });

  test("正常系: 編集画面で保存すると変更が一覧に反映される", async ({
    page,
  }) => {
    const todos = new TodosPage(page);
    await todos.open();

    await todos.edit();
    const editTodo = new EditTodoPage(page);
    await expect(editTodo.titleInput).toHaveValue(todoTitle);

    await editTodo.changeTitle(updatedTitle);
    await editTodo.save();

    await expect(page).toHaveURL(/\/todos$/);
    await expect(todos.title(updatedTitle)).toBeVisible();
  });

  test("正常系: 編集画面でキャンセルすると変更せずに一覧へ戻る", async ({
    page,
  }) => {
    const todos = new TodosPage(page);
    await todos.open();

    await todos.edit();
    const editTodo = new EditTodoPage(page);
    await editTodo.changeTitle("破棄されるタイトル");
    await editTodo.cancel();

    await expect(page).toHaveURL(/\/todos$/);
    await expect(todos.title(updatedTitle)).toBeVisible();
    await expect(todos.title("破棄されるタイトル")).not.toBeVisible();
  });

  test("正常系: 削除を確定すると Todo が一覧から消える", async ({ page }) => {
    const todos = new TodosPage(page);
    await todos.open();

    await todos.delete();

    await expect(todos.emptyMessage).toBeVisible();
  });
});
