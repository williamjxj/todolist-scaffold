import axios from 'axios'
import type { TodoItem, TodoItemCreate, TodoItemUpdate } from '../types/todo'

// Use VITE_API_URL if provided, otherwise default to relative /api for Vite proxy
// In production, setting VITE_API_URL to an absolute URL (e.g. https://api.yourdomain.com/api)
// allows the frontend to communicate with an independent backend.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add request interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please check if the backend server is running')
    }
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      throw new Error('Cannot connect to backend server. Make sure it is running on http://localhost:8173')
    }
    throw error
  }
)

export const todoApi = {
  // List all todos
  getAll: async (completed?: boolean, priority?: string, category?: string): Promise<TodoItem[]> => {
    const params: any = {}
    if (completed !== undefined) params.completed = completed
    if (priority) params.priority = priority
    if (category) params.category = category

    const response = await api.get<TodoItem[]>('/todos', { params })
    return response.data
  },

  // Get single todo by ID
  getById: async (id: number): Promise<TodoItem> => {
    const response = await api.get<TodoItem>(`/todos/${id}`)
    return response.data
  },

  // Create new todo
  create: async (todo: TodoItemCreate): Promise<TodoItem> => {
    const response = await api.post<TodoItem>('/todos', todo)
    return response.data
  },

  // Update todo
  update: async (id: number, todo: TodoItemUpdate): Promise<TodoItem> => {
    const response = await api.put<TodoItem>(`/todos/${id}`, todo)
    return response.data
  },

  // Delete todo
  delete: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`)
  },

  // Toggle completion status
  toggleComplete: async (id: number): Promise<TodoItem> => {
    const response = await api.patch<TodoItem>(`/todos/${id}/complete`)
    return response.data
  },
}
