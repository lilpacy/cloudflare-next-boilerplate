"use client";

import { useState, useTransition } from "react";
import { PrimaryButton, TextInput, Textarea } from "@cf-next/ui";
import { useRouter } from "next/navigation";
import { updateTodo } from "@/app/actions/todos";

type Todo = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
};

export function EditTodoForm({ todo }: { todo: Todo }) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [completed, setCompleted] = useState(todo.completed);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    startTransition(async () => {
      try {
        await updateTodo(todo.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          completed,
        });
        router.push("/todos");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update todo");
      }
    });
  };

  const handleCancel = () => {
    router.push("/todos");
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <TextInput
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            placeholder="Enter todo title"
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            placeholder="Enter todo description"
            rows={4}
            maxLength={1000}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="completed"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            disabled={isPending}
            className="h-5 w-5 rounded border-gray-300"
          />
          <label htmlFor="completed" className="text-sm font-medium">
            Mark as completed
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <PrimaryButton
            type="submit"
            disabled={isPending || !title.trim()}
            className="flex-1"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </PrimaryButton>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
