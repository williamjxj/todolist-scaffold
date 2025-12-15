import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AceternityButton } from './ui/aceternity-button'
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
        <AceternityButton
          type="submit"
          variant="add"
          disabled={loading || !description.trim()}
          aria-label="Add TODO item"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Adding...' : 'Add'}
        </AceternityButton>
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
