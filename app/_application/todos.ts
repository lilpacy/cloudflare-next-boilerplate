import "server-only";

import { NotFoundError } from "@/app/_domain/errors";
import type { Todo, TodoStats } from "@/app/_domain/todo";
import { countTodos, findTodoByIdForUser, findTodosByUser } from "@/app/_infrastructure/todos";
import { requireAdminUserId, requireUserId } from "./auth";

export async function listTodos(): Promise<Todo[]> {
  const userId = await requireUserId();
  return findTodosByUser(userId);
}

export async function getTodo(id: string): Promise<Todo> {
  const userId = await requireUserId();
  const todo = await findTodoByIdForUser(id, userId);
  if (!todo) throw new NotFoundError("Todo not found");
  return todo;
}

export async function getTodoStats(): Promise<TodoStats> {
  await requireAdminUserId();
  return countTodos();
}
