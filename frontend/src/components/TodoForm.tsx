import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AceternityButton } from './ui/aceternity-button'
import { validateDescription } from '../lib/utils'
import type { TodoItemCreate } from '../types/todo'

interface TodoFormProps {
  onSubmit: (todo: TodoItemCreate) => Promise<void>
  loading?: boolean
}

export const TodoForm = ({ onSubmit, loading = false }: TodoFormProps) => {
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateDescription(description)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      await onSubmit({
        description: description.trim(),
        priority,
        due_date: dueDate || undefined,
        category: category.trim() || undefined,
      })
      setDescription('')
      setPriority('Medium')
      setDueDate('')
      setCategory('')
      setError(null)
      setShowAdvanced(false)
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

      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          {showAdvanced ? 'Hide options' : 'More options (Priority, Date, Category)'}
        </button>
      </div>

      {showAdvanced && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Work, Personal"
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
        </div>
      )}
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
