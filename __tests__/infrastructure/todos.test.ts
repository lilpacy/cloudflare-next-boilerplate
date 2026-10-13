// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { toTodo } from "@/app/_infrastructure/todos";

vi.mock("@/app/_infrastructure/db", () => ({ getDb: vi.fn() }));

describe("Todo 行から DTO への変換", () => {
  it("正常系: 画面に渡す Todo には所有者 ID が含まれない", () => {
    const createdAt = new Date("2026-01-01T00:00:00Z");
    const updatedAt = new Date("2026-01-02T00:00:00Z");
    const todo = toTodo({
      id: "todo-1",
      title: "title",
      description: null,
      completed: true,
      userId: "user_secret",
      createdAt,
      updatedAt,
    });

    expect(todo).toStrictEqual({
      id: "todo-1",
      title: "title",
      description: null,
      completed: true,
      createdAt,
      updatedAt,
    });
  });
});
