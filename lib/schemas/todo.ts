import { z } from "zod";

export const todoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  completed: z.boolean().default(false),
});

export type TodoInput = z.infer<typeof todoSchema>;

export const updateTodoSchema = todoSchema.partial();
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
