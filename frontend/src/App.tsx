import { useState } from 'react'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { ErrorMessage } from './components/ErrorMessage'
import { useTodos } from './hooks/useTodos'
import type { TodoItemCreate } from './types/todo'

function App() {
  const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
  } = useTodos()

  const [dismissedError, setDismissedError] = useState<string | null>(null)

  const handleCreateTodo = async (todo: TodoItemCreate) => {
    await createTodo(todo)
  }

  const handleUpdateTodo = async (id: number, description: string) => {
    await updateTodo(id, { description })
  }

  const handleDeleteTodo = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this TODO item?')) {
      await deleteTodo(id)
    }
  }

  const handleToggleComplete = async (id: number) => {
    await toggleComplete(id)
  }

  const displayError = error && error !== dismissedError ? error : null

  // Check if error is a connection error and provide helpful message
  const isConnectionError = displayError?.toLowerCase().includes('cannot connect') ||
    displayError?.toLowerCase().includes('network error') ||
    displayError?.toLowerCase().includes('backend server')

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center">
            <img src="/logo.png" alt="Todo List Logo" className="h-10 w-10 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">TODO List</h1>
          </div>
          <h3 className="text-xl font-bold underline">By William Jiang</h3>
          <p className="text-gray-600 mt-2">Manage your tasks efficiently</p>
        </header>

        {isConnectionError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-semibold">Backend Connection Issue</p>
            <p className="text-yellow-700 text-sm mt-1">
              Make sure the backend server is running on <code className="bg-yellow-100 px-1 rounded">http://localhost:8000</code>
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Run: <code className="bg-yellow-100 px-1 rounded">cd backend/src && uvicorn app.main:app --reload --port 8000</code>
            </p>
          </div>
        )}

        <ErrorMessage
          message={displayError}
          onDismiss={() => setDismissedError(error || null)}
        />

        <TodoForm onSubmit={handleCreateTodo} loading={loading} />

        {loading && todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
            Loading...
          </div>
        ) : (
          <TodoList
            todos={todos}
            onToggleComplete={handleToggleComplete}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}

export default App
