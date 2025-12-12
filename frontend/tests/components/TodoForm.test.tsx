import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TodoForm } from '../../src/components/TodoForm'
import type { TodoItemCreate } from '../../src/types/todo'

describe('TodoForm', () => {
  it('should render form with input and submit button', () => {
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)
    expect(screen.getByPlaceholderText(/Enter a new TODO item/)).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('should call onSubmit when form is submitted with valid description', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText(/Enter a new TODO item/)
    const submitButton = screen.getByText('Add')

    fireEvent.change(input, { target: { value: 'Test TODO' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({ description: 'Test TODO' })
    })
  })

  it('should show error for empty description', async () => {
    const mockOnSubmit = vi.fn()
    render(<TodoForm onSubmit={mockOnSubmit} />)

    const input = screen.getByPlaceholderText(/Enter a new TODO item/)
    const submitButton = screen.getByText('Add')

    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/cannot be empty/)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
})
