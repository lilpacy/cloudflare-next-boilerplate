// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/app/_domain/errors";
import { getProfile } from "@/app/_application/profile";
import { getTodo, getTodoStats, listTodos } from "@/app/_application/todos";
import { getCurrentUserId, isAdmin } from "@/app/_infrastructure/auth";
import { countTodos, findTodoByIdForUser, findTodosByUser } from "@/app/_infrastructure/todos";
import { findProfile } from "@/app/_infrastructure/users";

vi.mock("@/app/_infrastructure/auth", () => ({ getCurrentUserId: vi.fn(), isAdmin: vi.fn() }));
vi.mock("@/app/_infrastructure/todos", () => ({
  countTodos: vi.fn(),
  findTodoByIdForUser: vi.fn(),
  findTodosByUser: vi.fn(),
}));
vi.mock("@/app/_infrastructure/users", () => ({ findProfile: vi.fn() }));

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
  ])("異常系: 未認証で %s を取得すると認証エラーになり、データには触れない", async (_, run) => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);

    await expect(run()).rejects.toBeInstanceOf(UnauthorizedError);
    expect(findTodosByUser).not.toHaveBeenCalled();
    expect(findTodoByIdForUser).not.toHaveBeenCalled();
    expect(findProfile).not.toHaveBeenCalled();
    expect(countTodos).not.toHaveBeenCalled();
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
