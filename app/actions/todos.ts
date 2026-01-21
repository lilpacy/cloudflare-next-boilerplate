"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, desc, sql } from "drizzle-orm";
import { todos } from "@/lib/db/schema";
import { todoSchema, updateTodoSchema, type TodoInput, type UpdateTodoInput } from "@/lib/schemas/todo";

async function getDb() {
  const { env } = await getCloudflareContext();
  return drizzle(env.DB);
}

export async function getTodos() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = await getDb();
  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt))
    .all();

  return userTodos;
}

export async function getTodoById(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const db = await getDb();
  const todo = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .get();

  if (!todo) {
    throw new Error("Todo not found");
  }

  return todo;
}

export async function createTodo(input: TodoInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedData = todoSchema.parse(input);

  const db = await getDb();
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

  const db = await getDb();

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

  const db = await getDb();

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

  const db = await getDb();

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

export async function getAllTodosStatsForAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin by getting their email
  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;

  const ADMIN_EMAILS = new Set<string>(
    process.env.ADMIN_EMAILS?.split(",").map(email => email.trim()) || []
  );

  if (!email || !ADMIN_EMAILS.has(email)) {
    throw new Error("Forbidden: Admin access required");
  }

  const db = await getDb();
  const allTodos = await db.select().from(todos).all();

  return {
    total: allTodos.length,
    completed: allTodos.filter((t) => t.completed).length,
    pending: allTodos.filter((t) => !t.completed).length,
  };
}
