import { useState } from 'react'
import { ColourfulText } from './components/ui/colourful-text'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { ErrorMessage } from './components/ErrorMessage'
import { TodoDemo } from './components/TodoDemo'
import { FloatingMenu, FloatingMenuOption } from './components/ui/floating-menu'
import { Dialog } from './components/ui/dialog'
import { Settings, FileText, Play, MessageCircle } from 'lucide-react'
import { useTodos } from './hooks/useTodos'
import type { TodoItemCreate } from './types/todo'

function App() {
  const [showDemo, setShowDemo] = useState(false)

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

  const handleUpdateTodo = async (id: number, updates: any) => {
    await updateTodo(id, updates)
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

  // Floating menu options - only 4 items as specified
  // Order: bottom to top (chatbot, view-demo, docs, settings)
  const floatingMenuOptions: FloatingMenuOption[] = [
    {
      id: 'chatbot',
      label: 'Chatbot',
      icon: <MessageCircle />,
      onClick: () => {
        alert('Chatbot: AI assistant coming soon!')
      },
    },
    {
      id: 'view-demo',
      label: 'View Demo',
      icon: <Play />,
      onClick: () => {
        setShowDemo(true)
      },
    },
    {
      id: 'docs',
      label: 'Docs',
      icon: <FileText />,
      onClick: () => {
        alert('Docs: Check the /docs folder in the project for documentation files.')
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings />,
      onClick: () => {
        alert('Settings clicked!')
      },
    },
  ]

  // Check if error is a connection error and provide helpful message
  const isConnectionError = displayError?.toLowerCase().includes('cannot connect') ||
    displayError?.toLowerCase().includes('network error') ||
    displayError?.toLowerCase().includes('backend server')

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-14 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <img
                src="/logo.png"
                alt="Todo List Logo"
                className="h-16 w-16 rounded-2xl shadow-xl ring-2 ring-white"
              />
              <div className="absolute -inset-1 bg-linear-to-r from-purple-400 to-blue-500 rounded-2xl blur opacity-20 -z-10" />
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-center">
              <ColourfulText text="Todo List Scaffold" />
            </h1>
          </div>

          <div className="mt-8 flex items-center gap-4 w-full max-w-md">
            <div className="h-[1px] flex-1 bg-linear-to-r from-transparent via-gray-200 to-gray-200" />
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.5em] text-gray-400/80 whitespace-nowrap">
              Manage your tasks efficiently
            </p>
            <div className="h-[1px] flex-1 bg-linear-to-r from-gray-200 via-gray-200 to-transparent" />
          </div>
        </header>

        {isConnectionError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-semibold">Backend Connection Issue</p>
            <p className="text-yellow-700 text-sm mt-1">
              Cannot connect to backend API.
              {import.meta.env.VITE_API_URL?.includes('localhost') ? (
                <>
                  Make sure the backend server is running on <code className="bg-yellow-100 px-1 rounded">http://localhost:8173</code>
                  <br />
                  Run: <code className="bg-yellow-100 px-1 rounded">cd backend/src && uvicorn app.main:app --reload --port 8173</code>
                </>
              ) : (
                <>
                  {' '}Backend URL: <code className="bg-yellow-100 px-1 rounded">{import.meta.env.VITE_API_URL || 'https://todolist-scaffold.onrender.com/api'}</code>
                </>
              )}
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

      {/* Floating Menu */}
      <FloatingMenu
        options={floatingMenuOptions}
        position="bottom-right"
        size="md"
      />

      {/* Todo Demo Dialog */}
      <Dialog
        isOpen={showDemo}
        onClose={() => setShowDemo(false)}
        title="Interactive Demo"
      >
        <TodoDemo />
      </Dialog>
    </div>
  )
}

export default App
