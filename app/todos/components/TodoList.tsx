"use client";

import Link from "next/link";
import { format } from "date-fns";
import { deleteTodo, toggleTodoCompleted } from "@/app/actions/todos";
import { useState, useTransition } from "react";

type Todo = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function TodoList({ todos }: { todos: Todo[] }) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    startTransition(async () => {
      await toggleTodoCompleted(id);
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this todo?")) {
      setDeletingId(id);
      startTransition(async () => {
        await deleteTodo(id);
        setDeletingId(null);
      });
    }
  };

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No todos yet. Create your first todo above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`border rounded-lg p-4 transition-opacity ${
            deletingId === todo.id ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
              disabled={isPending}
              className="mt-1 h-5 w-5 rounded border-gray-300 cursor-pointer"
            />
            <div className="flex-1">
              <Link href={`/todos/${todo.id}`}>
                <h3
                  className={`text-lg font-semibold hover:text-blue-600 ${
                    todo.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {todo.title}
                </h3>
              </Link>
              {todo.description && (
                <p className="text-gray-600 mt-1">{todo.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-2">
                Created {format(new Date(todo.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/todos/${todo.id}`}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(todo.id)}
                disabled={isPending || deletingId === todo.id}
                className="px-3 py-1 text-sm border rounded hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
