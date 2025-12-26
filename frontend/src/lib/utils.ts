import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates a TODO item description
 * @param desc - The description to validate
 * @returns Error message string if invalid, null if valid
 */
export function validateDescription(desc: string): string | null {
  const trimmed = desc.trim()
  if (!trimmed) {
    return 'Description cannot be empty or whitespace-only'
  }
  if (trimmed.length > 500) {
    return 'Description cannot exceed 500 characters'
  }
  return null
}
