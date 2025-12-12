import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TodoList } from '../../src/components/TodoList'
import type { TodoItem } from '../../src/types/todo'

const mockTodos: TodoItem[] = [
  {
    id: 1,
    description: 'Pending TODO',
    completed: false,
    created_at: '2025-01-27T10:00:00Z',
    updated_at: '2025-01-27T10:00:00Z',
  },
  {
    id: 2,
    description: 'Completed TODO',
    completed: true,
    created_at: '2025-01-27T09:00:00Z',
    updated_at: '2025-01-27T09:30:00Z',
  },
]

describe('TodoList', () => {
  it('should render empty state when no todos', () => {
    render(<TodoList todos={[]} />)
    expect(screen.getByText(/No TODO items yet/)).toBeInTheDocument()
  })

  it('should render pending and completed sections', () => {
    render(<TodoList todos={mockTodos} />)
    expect(screen.getByText(/Pending \(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/Completed \(1\)/)).toBeInTheDocument()
  })

  it('should display todo descriptions', () => {
    render(<TodoList todos={mockTodos} />)
    expect(screen.getByText('Pending TODO')).toBeInTheDocument()
    expect(screen.getByText('Completed TODO')).toBeInTheDocument()
  })
})
