"use server";

import { revalidatePath } from "next/cache";
import { createTodo, deleteTodo, toggleTodo, updateTodo } from "@/app/_application/todos";
import type { TodoInput, UpdateTodoInput } from "@/app/_domain/todo";
import { runAction, type ActionResult } from "@/app/_lib/action-result";

export async function createTodoAction(input: TodoInput): Promise<ActionResult> {
  return runAction(async () => {
    await createTodo(input);
    revalidatePath("/todos");
  });
}

export async function updateTodoAction(id: string, input: UpdateTodoInput): Promise<ActionResult> {
  return runAction(async () => {
    await updateTodo(id, input);
    revalidatePath("/todos");
    revalidatePath(`/todos/${id}`);
  });
}

export async function toggleTodoAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await toggleTodo(id);
    revalidatePath("/todos");
  });
}

export async function deleteTodoAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await deleteTodo(id);
    revalidatePath("/todos");
  });
}
