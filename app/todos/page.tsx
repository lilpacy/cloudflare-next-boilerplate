import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTodos } from "@/app/actions/todos";
import { TodoList } from "./components/TodoList";
import { CreateTodoForm } from "./components/CreateTodoForm";

export const metadata = {
  title: "Todos",
  description: "Manage your todos",
};

export default async function TodosPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const todos = await getTodos();

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
