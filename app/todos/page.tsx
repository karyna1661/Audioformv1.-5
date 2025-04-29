import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export default async function TodosPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: todos, error } = await supabase.from("todos").select("*")

  if (error) {
    console.error("Error fetching todos:", error)
    return <div>Error loading todos</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Todos</h1>
      {todos && todos.length > 0 ? (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="p-2 border rounded">
              {todo.title || todo.task || JSON.stringify(todo)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No todos found</p>
      )}
    </div>
  )
}
