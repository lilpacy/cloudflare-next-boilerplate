import { Suspense } from "react";
import { listTodos } from "@/app/_application/todos";
import { handlePageError } from "@/app/_lib/page-errors";
import { TodoList } from "./components/TodoList";
import { CreateTodoForm } from "./components/CreateTodoForm";

export const metadata = {
  title: "Todos",
  description: "Manage your todos",
};

export default async function TodosPage() {
  const todos = await listTodos().catch(handlePageError);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Todos</h1>
        <p className="text-gray-600">Manage your tasks efficiently</p>
      </div>

      <div className="mb-8">
        <CreateTodoForm />
      </div>

      <Suspense fallback={<div>Loading todos...</div>}>
        <TodoList todos={todos} />
      </Suspense>
    </div>
  );
}
