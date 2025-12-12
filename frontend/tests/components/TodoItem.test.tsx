import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TodoItemComponent } from '../../src/components/TodoItem'
import type { TodoItem } from '../../src/types/todo'

const mockTodo: TodoItem = {
  id: 1,
  description: 'Test TODO',
  completed: false,
  created_at: '2025-01-27T10:00:00Z',
  updated_at: '2025-01-27T10:00:00Z',
}

describe('TodoItemComponent', () => {
  it('should render todo description', () => {
    render(<TodoItemComponent todo={mockTodo} />)
    expect(screen.getByText('Test TODO')).toBeInTheDocument()
  })

  it('should call onToggleComplete when checkbox is clicked', () => {
    const mockToggle = vi.fn()
    render(<TodoItemComponent todo={mockTodo} onToggleComplete={mockToggle} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(mockToggle).toHaveBeenCalledWith(1)
  })

  it('should show edit mode when edit button is clicked', () => {
    const mockUpdate = vi.fn()
    render(<TodoItemComponent todo={mockTodo} onUpdate={mockUpdate} />)

    const editButton = screen.getByText('Edit')
    fireEvent.click(editButton)

    expect(screen.getByLabelText(/Edit TODO description/)).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('should call onDelete when delete button is clicked', () => {
    const mockDelete = vi.fn()
    render(<TodoItemComponent todo={mockTodo} onDelete={mockDelete} />)

    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)

    expect(mockDelete).toHaveBeenCalledWith(1)
  })
})
