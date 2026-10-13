import { expect, type Page } from "@playwright/test";
import { TodosPage } from "../pages/TodosPage";
import type { TestBindings } from "./CloudflareBindings";
import { ResourceFixture } from "./ResourceFixture";
import type { TestUser } from "./UserResource";

export type TestTodo = { id: string; title: string; description: string };

export class TodoResource extends ResourceFixture<TestTodo> {
  private readonly todo: TestTodo = {
    id: crypto.randomUUID(),
    title: `E2E Todo ${crypto.randomUUID()}`,
    description: "E2E テスト用の説明",
  };

  constructor(
    private readonly bindings: TestBindings,
    private readonly user: TestUser,
    private readonly page: Page
  ) {
    super();
  }

  protected async create(): Promise<TestTodo> {
    await this.bindings.DB.prepare(
      "INSERT INTO todos (id, title, description, completed, user_id) VALUES (?, ?, ?, 0, ?)"
    ).bind(this.todo.id, this.todo.title, this.todo.description, this.user.id).run();
    return this.todo;
  }

  protected async precheck(todo: TestTodo): Promise<void> {
    const todos = new TodosPage(this.page);
    await todos.open();
    await expect(todos.title(todo.title)).toBeVisible();
    await expect(todos.completionCheckbox).not.toBeChecked();
  }

  protected async cleanup(): Promise<void> {
    await this.bindings.DB.prepare("DELETE FROM todos WHERE id = ? AND user_id = ?")
      .bind(this.todo.id, this.user.id).run();
  }
}
