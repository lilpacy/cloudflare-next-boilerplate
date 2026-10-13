// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/domain/errors";
import { getProfile } from "@/application/profile";
import {
  createTodo,
  deleteTodo,
  getTodo,
  getTodoStats,
  listTodos,
  toggleTodo,
  updateTodo,
} from "@/application/todos";
import { getCurrentUserId, isAdmin } from "@/infrastructure/auth";
import {
  countTodos,
  deleteTodoForUser,
  findTodoByIdForUser,
  findTodosByUser,
  insertTodo,
  updateTodoForUser,
} from "@/infrastructure/todos";
import { findProfile } from "@/infrastructure/users";

vi.mock("@/infrastructure/auth", () => ({ getCurrentUserId: vi.fn(), isAdmin: vi.fn() }));
vi.mock("@/infrastructure/todos", () => ({
  countTodos: vi.fn(),
  deleteTodoForUser: vi.fn(),
  findTodoByIdForUser: vi.fn(),
  findTodosByUser: vi.fn(),
  insertTodo: vi.fn(),
  updateTodoForUser: vi.fn(),
}));
vi.mock("@/infrastructure/users", () => ({ findProfile: vi.fn() }));

const todo = {
  id: "todo-1",
  title: "title",
  description: null,
  completed: false,
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("読み取りユースケースの認証・認可", () => {
  it.each([
    ["Todo 一覧", () => listTodos()],
    ["Todo 詳細", () => getTodo("todo-1")],
    ["プロフィール", () => getProfile()],
    ["管理者向け集計", () => getTodoStats()],
    ["Todo 作成", () => createTodo({ title: "t", completed: false })],
    ["Todo 更新", () => updateTodo("todo-1", { title: "t" })],
    ["Todo 完了切替", () => toggleTodo("todo-1")],
    ["Todo 削除", () => deleteTodo("todo-1")],
  ])("異常系: 未認証で %s を行うと認証エラーになり、データには触れない", async (_, run) => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);

    await expect(run()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(findTodosByUser).not.toHaveBeenCalled();
    expect(findTodoByIdForUser).not.toHaveBeenCalled();
    expect(findProfile).not.toHaveBeenCalled();
    expect(countTodos).not.toHaveBeenCalled();
    expect(insertTodo).not.toHaveBeenCalled();
    expect(updateTodoForUser).not.toHaveBeenCalled();
    expect(deleteTodoForUser).not.toHaveBeenCalled();
  });
});

describe("Todo の作成", () => {
  it("正常系: 入力は本人の Todo として保存され、説明なしは null で保存される", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("user-1");
    vi.mocked(insertTodo).mockResolvedValue(todo);

    await expect(createTodo({ title: "title", completed: false })).resolves.toBe(todo);
    expect(insertTodo).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", title: "title", description: null, completed: false })
    );
  });

  it("異常系: タイトルが空の入力は検証エラーになり、保存されない", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("user-1");

    await expect(createTodo({ title: "", completed: false })).rejects.toBeInstanceOf(ValidationError);
    expect(insertTodo).not.toHaveBeenCalled();
  });
});

describe("Todo の変更", () => {
  it("正常系: 完了切替は現在の状態を反転して本人の Todo を更新する", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("user-1");
    vi.mocked(findTodoByIdForUser).mockResolvedValue({ ...todo, completed: false });
    vi.mocked(updateTodoForUser).mockResolvedValue({ ...todo, completed: true });

    await expect(toggleTodo("todo-1")).resolves.toMatchObject({ completed: true });
    expect(updateTodoForUser).toHaveBeenCalledWith("todo-1", "user-1", { completed: true });
  });

  it.each([
    ["更新", () => updateTodo("todo-1", { title: "t" })],
    ["完了切替", () => toggleTodo("todo-1")],
    ["削除", () => deleteTodo("todo-1")],
  ])("異常系: 自分のものとして見つからない Todo の%sは存在しない扱いになる", async (_, run) => {
    vi.mocked(getCurrentUserId).mockResolvedValue("user-1");
    vi.mocked(findTodoByIdForUser).mockResolvedValue(null);
    vi.mocked(updateTodoForUser).mockResolvedValue(null);
    vi.mocked(deleteTodoForUser).mockResolvedValue(false);

    await expect(run()).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("Todo の取得", () => {
  it("正常系: 自分の Todo は本人の ID で検索され、そのまま返る", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("user-1");
    vi.mocked(findTodoByIdForUser).mockResolvedValue(todo);

    await expect(getTodo("todo-1")).resolves.toBe(todo);
    expect(findTodoByIdForUser).toHaveBeenCalledWith("todo-1", "user-1");
  });

  it("異常系: 自分のものとして見つからない Todo は存在しない扱いになる", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("user-1");
    vi.mocked(findTodoByIdForUser).mockResolvedValue(null);

    await expect(getTodo("todo-1")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("管理者向け集計", () => {
  it("正常系: 管理者には全体の集計が返る", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("admin-1");
    vi.mocked(isAdmin).mockResolvedValue(true);
    vi.mocked(countTodos).mockResolvedValue({ total: 3, completed: 1, pending: 2 });

    await expect(getTodoStats()).resolves.toEqual({ total: 3, completed: 1, pending: 2 });
    expect(isAdmin).toHaveBeenCalledWith("admin-1");
  });

  it("異常系: 管理者でないユーザーは拒否され、集計は行われない", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("user-1");
    vi.mocked(isAdmin).mockResolvedValue(false);

    await expect(getTodoStats()).rejects.toBeInstanceOf(ForbiddenError);
    expect(countTodos).not.toHaveBeenCalled();
  });
});
