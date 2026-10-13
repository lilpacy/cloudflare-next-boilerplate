"use client";

import { useState, useTransition } from "react";
import { PrimaryButton, TextInput, Textarea } from "@cf-next/ui";
import { createTodoAction } from "@/app/todos/actions";
import { useRouter } from "next/navigation";

export function CreateTodoForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
      const result = await createTodoAction({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setDescription("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Create New Todo</h2>

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
            rows={3}
            maxLength={1000}
          />
        </div>

        <PrimaryButton
          type="submit"
          disabled={isPending || !title.trim()}
          className="w-full"
        >
          {isPending ? "Creating..." : "Create Todo"}
        </PrimaryButton>
      </div>
    </form>
  );
}
