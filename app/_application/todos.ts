import "server-only";

import { NotFoundError, ValidationError } from "@/app/_domain/errors";
import {
  todoSchema,
  updateTodoSchema,
  type Todo,
  type TodoInput,
  type TodoStats,
  type UpdateTodoInput,
} from "@/app/_domain/todo";
import {
  countTodos,
  deleteTodoForUser,
  findTodoByIdForUser,
  findTodosByUser,
  insertTodo,
  updateTodoForUser,
} from "@/app/_infrastructure/todos";
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

function parse<T>(result: { success: true; data: T } | { success: false; error: { issues: { message: string }[] } }): T {
  if (result.success) return result.data;
  throw new ValidationError(result.error.issues.map((issue) => issue.message).join(", "));
}

export async function createTodo(input: TodoInput): Promise<Todo> {
  const userId = await requireUserId();
  const data = parse(todoSchema.safeParse(input));
  return insertTodo({
    id: crypto.randomUUID(),
    userId,
    title: data.title,
    description: data.description ?? null,
    completed: data.completed,
  });
}

export async function updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
  const userId = await requireUserId();
  const data = parse(updateTodoSchema.safeParse(input));
  const todo = await updateTodoForUser(id, userId, data);
  if (!todo) throw new NotFoundError("Todo not found");
  return todo;
}

export async function toggleTodo(id: string): Promise<Todo> {
  const userId = await requireUserId();
  const existing = await findTodoByIdForUser(id, userId);
  if (!existing) throw new NotFoundError("Todo not found");
  const todo = await updateTodoForUser(id, userId, { completed: !existing.completed });
  if (!todo) throw new NotFoundError("Todo not found");
  return todo;
}

export async function deleteTodo(id: string): Promise<void> {
  const userId = await requireUserId();
  const deleted = await deleteTodoForUser(id, userId);
  if (!deleted) throw new NotFoundError("Todo not found");
}
