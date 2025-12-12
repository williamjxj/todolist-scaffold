export interface TodoItem {
  id: number
  description: string
  completed: boolean
  created_at: string // ISO 8601 datetime string
  updated_at: string // ISO 8601 datetime string
}

export interface TodoItemCreate {
  description: string
}

export interface TodoItemUpdate {
  description?: string
  completed?: boolean
}
