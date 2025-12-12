import { useState } from 'react'
import type { TodoItem } from '../types/todo'

interface TodoItemProps {
  todo: TodoItem
  onToggleComplete?: (id: number) => void
  onUpdate?: (id: number, description: string) => void
  onDelete?: (id: number) => void
  loading?: boolean
}

export const TodoItemComponent = ({
  todo,
  onToggleComplete,
  onUpdate,
  onDelete,
  loading = false,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editDescription, setEditDescription] = useState(todo.description)
  const [editError, setEditError] = useState<string | null>(null)

  const validateDescription = (desc: string): string | null => {
    const trimmed = desc.trim()
    if (!trimmed) {
      return 'Description cannot be empty or whitespace-only'
    }
    if (trimmed.length > 500) {
      return 'Description cannot exceed 500 characters'
    }
    return null
  }

  const handleSave = () => {
    setEditError(null)
    const validationError = validateDescription(editDescription)
    if (validationError) {
      setEditError(validationError)
      return
    }

    if (onUpdate) {
      try {
        onUpdate(todo.id, editDescription.trim())
        setIsEditing(false)
        setEditError(null)
      } catch (err) {
        setEditError(err instanceof Error ? err.message : 'Failed to update todo')
      }
    }
  }

  const handleCancel = () => {
    setEditDescription(todo.description)
    setIsEditing(false)
    setEditError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border rounded-lg transition-colors ${
        todo.completed
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-300'
      }`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete?.(todo.id)}
        disabled={loading || isEditing}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        aria-label={`Mark "${todo.description}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <div className="flex-1">
        {isEditing ? (
          <div>
            <textarea
              value={editDescription}
              onChange={(e) => {
                setEditDescription(e.target.value)
                setEditError(null)
              }}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={loading}
              maxLength={500}
              autoFocus
              aria-label="Edit TODO description"
            />
            {editError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {editError}
              </p>
            )}
            {editDescription.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {editDescription.length}/500 characters
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSave}
                disabled={loading || !editDescription.trim()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                aria-label="Save changes"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p
              className={`${
                todo.completed
                  ? 'line-through text-gray-500'
                  : 'text-gray-900'
              }`}
            >
              {todo.description}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created: {new Date(todo.created_at).toLocaleString()}
            </p>
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
          {onUpdate && (
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
              aria-label={`Edit "${todo.description}"`}
              title="Edit this TODO item"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(todo.id)}
              disabled={loading}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
              aria-label={`Delete "${todo.description}"`}
              title="Delete this TODO item"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
