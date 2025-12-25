export interface TodoItem {
  id: number
  description: string
  completed: boolean
  priority: string
  due_date?: string
  category?: string
  created_at: string // ISO 8601 datetime string
  updated_at: string // ISO 8601 datetime string
}

export interface TodoItemCreate {
  description: string
  priority?: string
  due_date?: string
  category?: string
}

export interface TodoItemUpdate {
  description?: string
  completed?: boolean
  priority?: string
  due_date?: string
  category?: string
}
