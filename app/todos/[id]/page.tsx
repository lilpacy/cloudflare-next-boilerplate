import { getTodo } from "@/app/_application/todos";
import { handlePageError } from "@/app/_lib/page-errors";
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
  const { id } = await params;
  const todo = await getTodo(id).catch(handlePageError);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Todo</h1>
        <p className="text-gray-600">Update your todo information</p>
      </div>

      <EditTodoForm todo={todo} />
    </div>
  );
}
