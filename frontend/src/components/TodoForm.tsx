import { useState } from 'react'
import type { TodoItemCreate } from '../types/todo'

interface TodoFormProps {
  onSubmit: (todo: TodoItemCreate) => Promise<void>
  loading?: boolean
}

export const TodoForm = ({ onSubmit, loading = false }: TodoFormProps) => {
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateDescription(description)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      await onSubmit({ description: description.trim() })
      setDescription('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading && description.trim()) {
              handleSubmit(e)
            }
          }}
          placeholder="Enter a new TODO item..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
          maxLength={500}
          aria-label="TODO item description"
        />
        <button
          type="submit"
          disabled={loading || !description.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Add TODO item"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {description.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/500 characters
        </p>
      )}
    </form>
  )
}
