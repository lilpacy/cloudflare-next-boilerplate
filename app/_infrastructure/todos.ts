import "server-only";

import { and, desc, eq } from "drizzle-orm";
import type { Todo, TodoStats } from "@/app/_domain/todo";
import { getDb } from "./db";
import { todos } from "./schema";

type TodoRow = typeof todos.$inferSelect;

export function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function findTodosByUser(userId: string): Promise<Todo[]> {
  const rows = await getDb()
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt))
    .all();
  return rows.map(toTodo);
}

export async function findTodoByIdForUser(id: string, userId: string): Promise<Todo | null> {
  const row = await getDb()
    .select()
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .get();
  return row ? toTodo(row) : null;
}

export async function countTodos(): Promise<TodoStats> {
  const rows = await getDb().select({ completed: todos.completed }).from(todos).all();
  const completed = rows.filter((row) => row.completed).length;
  return { total: rows.length, completed, pending: rows.length - completed };
}
