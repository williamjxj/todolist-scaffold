import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { todoApi } from '../../src/services/api'
import type { TodoItem, TodoItemCreate } from '../../src/types/todo'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

describe('todoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all todos', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          description: 'Test TODO',
          completed: false,
          created_at: '2025-01-27T10:00:00Z',
          updated_at: '2025-01-27T10:00:00Z',
        },
      ]

      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: mockTodos }),
      })

      const result = await todoApi.getAll()
      expect(result).toEqual(mockTodos)
    })
  })

  describe('create', () => {
    it('should create a new todo', async () => {
      const newTodo: TodoItemCreate = { description: 'New TODO' }
      const createdTodo: TodoItem = {
        id: 1,
        description: 'New TODO',
        completed: false,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:00:00Z',
      }

      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: createdTodo }),
      })

      const result = await todoApi.create(newTodo)
      expect(result).toEqual(createdTodo)
    })
  })

  describe('update', () => {
    it('should update a todo', async () => {
      const updatedTodo: TodoItem = {
        id: 1,
        description: 'Updated TODO',
        completed: true,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:05:00Z',
      }

      mockedAxios.create.mockReturnValue({
        put: vi.fn().mockResolvedValue({ data: updatedTodo }),
      })

      const result = await todoApi.update(1, { description: 'Updated TODO', completed: true })
      expect(result).toEqual(updatedTodo)
    })
  })

  describe('delete', () => {
    it('should delete a todo', async () => {
      mockedAxios.create.mockReturnValue({
        delete: vi.fn().mockResolvedValue({}),
      })

      await todoApi.delete(1)
      // Should not throw
      expect(true).toBe(true)
    })
  })

  describe('toggleComplete', () => {
    it('should toggle completion status', async () => {
      const toggledTodo: TodoItem = {
        id: 1,
        description: 'Test TODO',
        completed: true,
        created_at: '2025-01-27T10:00:00Z',
        updated_at: '2025-01-27T10:05:00Z',
      }

      mockedAxios.create.mockReturnValue({
        patch: vi.fn().mockResolvedValue({ data: toggledTodo }),
      })

      const result = await todoApi.toggleComplete(1)
      expect(result).toEqual(toggledTodo)
    })
  })
})
