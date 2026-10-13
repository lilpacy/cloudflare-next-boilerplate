"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { todoSchema, updateTodoSchema, type TodoInput, type UpdateTodoInput } from "@/app/_domain/todo";
import { getDb } from "@/app/_infrastructure/db";
import { todos } from "@/app/_infrastructure/schema";

export async function createTodo(input: TodoInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = todoSchema.parse(input);

  const db = getDb();
  const id = crypto.randomUUID();

  await db.insert(todos).values({
    id,
    title: validatedData.title,
    description: validatedData.description || null,
    completed: validatedData.completed || false,
    userId,
    createdAt: sql`(unixepoch())`,
    updatedAt: sql`(unixepoch())`,
  });

  revalidatePath("/todos");
  return { id };
}

export async function updateTodo(id: string, input: UpdateTodoInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = updateTodoSchema.parse(input);

  const db = getDb();

  // Check if todo exists and belongs to user
  const existingTodo = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .get();

  if (!existingTodo) {
    throw new Error("Todo not found");
  }

  await db
    .update(todos)
    .set({
      ...validatedData,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(todos.id, id));

  revalidatePath("/todos");
  revalidatePath(`/todos/${id}`);
  return { id };
}

export async function deleteTodo(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  // Check if todo exists and belongs to user
  const existingTodo = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .get();

  if (!existingTodo) {
    throw new Error("Todo not found");
  }

  await db.delete(todos).where(eq(todos.id, id));

  revalidatePath("/todos");
  return { success: true };
}

export async function toggleTodoCompleted(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = getDb();

  // Get current todo
  const existingTodo = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .get();

  if (!existingTodo) {
    throw new Error("Todo not found");
  }

  // Toggle completed status
  await db
    .update(todos)
    .set({
      completed: !existingTodo.completed,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(todos.id, id));

  revalidatePath("/todos");
  return { success: true };
}
