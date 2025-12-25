import { TodoItemComponent } from './TodoItem'
import type { TodoItem } from '../types/todo'

interface TodoListProps {
  todos: TodoItem[]
  onToggleComplete?: (id: number) => void
  onUpdate?: (id: number, updates: Partial<TodoItem>) => void
  onDelete?: (id: number) => void
  loading?: boolean
}

export const TodoList = ({
  todos,
  onToggleComplete,
  onUpdate,
  onDelete,
  loading = false,
}: TodoListProps) => {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500" role="status">
        <p>No TODO items yet. Create one to get started!</p>
      </div>
    )
  }

  const pendingTodos = todos.filter((todo) => !todo.completed)
  const completedTodos = todos.filter((todo) => todo.completed)

  return (
    <div className="space-y-4">
      {pendingTodos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-700" id="pending-heading">
            Pending ({pendingTodos.length})
          </h2>
          <div className="space-y-2">
            {pendingTodos.map((todo) => (
              <TodoItemComponent
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onUpdate={onUpdate}
                onDelete={onDelete}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}

      {completedTodos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-500" id="completed-heading">
            Completed ({completedTodos.length})
          </h2>
          <div className="space-y-2">
            {completedTodos.map((todo) => (
              <TodoItemComponent
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onUpdate={onUpdate}
                onDelete={onDelete}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
