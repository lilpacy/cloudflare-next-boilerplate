import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTodoById } from "@/app/actions/todos";
import { EditTodoForm } from "./EditTodoForm";

export const metadata = {
  title: "Edit Todo",
  description: "Edit your todo",
};

export default async function EditTodoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    const todo = await getTodoById(id);

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Todo</h1>
          <p className="text-gray-600">Update your todo information</p>
        </div>

        <EditTodoForm todo={todo} />
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Todo not found"}
          </p>
        </div>
      </div>
    );
  }
}
