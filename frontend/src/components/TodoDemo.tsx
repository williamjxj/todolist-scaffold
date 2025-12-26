import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ListTodo } from 'lucide-react'
import { AceternityButton } from './ui/aceternity-button'
import type { TodoItem } from '../types/todo'

interface TodoDemoProps {
  onClose?: () => void
}

type DemoStep = 'idle' | 'typing' | 'adding' | 'completing' | 'deleting' | 'resetting'

export const TodoDemo = ({ }: TodoDemoProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [cursorVisible, setCursorVisible] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [currentStep, setCurrentStep] = useState<DemoStep>('idle')

  // Refs for interactive elements
  const inputRef = useRef<HTMLInputElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const checkboxRef = useRef<HTMLInputElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const nextIdRef = useRef(1)

  const containerRef = useRef<HTMLDivElement>(null)

  // Move cursor to element position with retry logic
  const moveCursorTo = async (element: HTMLElement | null, delay: number = 0, retries: number = 5): Promise<void> => {
    if (!containerRef.current) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return moveCursorTo(element, delay, retries - 1)
      }
      return Promise.resolve()
    }

    if (!element) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return moveCursorTo(element, delay, retries - 1)
      }
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          const rect = element.getBoundingClientRect()
          const containerRect = containerRef.current!.getBoundingClientRect()

          // Check if element is visible and has valid dimensions
          if (rect.width === 0 && rect.height === 0 && retries > 0) {
            setTimeout(() => {
              moveCursorTo(element, 0, retries - 1).then(resolve)
            }, 200)
            return
          }

          setCursorPosition({
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
          })
          setCursorVisible(true)
          resolve()
        } catch (error) {
          console.warn('Error moving cursor:', error)
          if (retries > 0) {
            setTimeout(() => {
              moveCursorTo(element, 0, retries - 1).then(resolve)
            }, 200)
          } else {
            resolve()
          }
        }
      }, delay)
    })
  }

  // Simulate click
  const simulateClick = async (duration: number = 300) => {
    setIsClicking(true)
    await new Promise((resolve) => setTimeout(resolve, duration))
    setIsClicking(false)
  }

  // Type text into input
  const typeText = async (text: string, speed: number = 50) => {
    setInputValue('')
    for (let i = 0; i <= text.length; i++) {
      setInputValue(text.slice(0, i))
      await new Promise((resolve) => setTimeout(resolve, speed))
    }
  }

  // Demo sequence
  useEffect(() => {
    let isMounted = true

    const runDemo = async () => {
      if (!isMounted) return

      try {
        // Initial delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Step 1: Add a new todo
        if (!isMounted) return
        setCurrentStep('typing')
        await moveCursorTo(inputRef.current, 500)
        await new Promise((resolve) => setTimeout(resolve, 300))

        await typeText('Complete project documentation', 40)
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (!isMounted) return
        setCurrentStep('adding')
        await moveCursorTo(addButtonRef.current, 300)
        await new Promise((resolve) => setTimeout(resolve, 200))
        await simulateClick(200)

        // Add todo
        const newTodo: TodoItem = {
          id: nextIdRef.current++,
          description: 'Complete project documentation',
          completed: false,
          priority: 'Medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setTodos([newTodo])
        setInputValue('')
        await new Promise((resolve) => setTimeout(resolve, 1200))

        // Step 2: Complete the todo (wait for DOM to update)
        if (!isMounted) return
        setCurrentStep('completing')
        await new Promise((resolve) => setTimeout(resolve, 500))
        await moveCursorTo(checkboxRef.current, 500)
        await new Promise((resolve) => setTimeout(resolve, 300))
        await simulateClick(200)

        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === newTodo.id ? { ...todo, completed: true, updated_at: new Date().toISOString() } : todo
          )
        )
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Step 3: Add another todo first (so we have something to delete)
        if (!isMounted) return
        setCurrentStep('typing')
        await moveCursorTo(inputRef.current, 500)
        await new Promise((resolve) => setTimeout(resolve, 300))

        await typeText('Review code changes', 40)
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (!isMounted) return
        setCurrentStep('adding')
        await moveCursorTo(addButtonRef.current, 300)
        await new Promise((resolve) => setTimeout(resolve, 200))
        await simulateClick(200)

        const secondTodo: TodoItem = {
          id: nextIdRef.current++,
          description: 'Review code changes',
          completed: false,
          priority: 'Medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setTodos((prev) => [secondTodo, ...prev])
        setInputValue('')
        // Wait longer for DOM to update and refs to be assigned
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Step 4: Delete the todo (wait for DOM to update with new todo)
        if (!isMounted) return
        setCurrentStep('deleting')
        // Give extra time for refs to be properly assigned to the new pending todo
        await new Promise((resolve) => setTimeout(resolve, 800))
        await moveCursorTo(deleteButtonRef.current, 500)
        await new Promise((resolve) => setTimeout(resolve, 300))
        await simulateClick(200)

        // Animate deletion
        await new Promise((resolve) => setTimeout(resolve, 300))
        setTodos((prev) => prev.filter((todo) => todo.id !== secondTodo.id))
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Reset for loop
        if (!isMounted) return
        setCurrentStep('resetting')
        setCursorVisible(false)
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Reset state
        if (!isMounted) return
        setTodos([])
        setInputValue('')
        setCurrentStep('idle')
        nextIdRef.current = 1

        // Restart demo
        if (isMounted) {
          runDemo()
        }
      } catch (error) {
        console.error('Demo error:', error)
        // Reset and retry after error
        if (isMounted) {
          setTodos([])
          setInputValue('')
          setCurrentStep('idle')
          setCursorVisible(false)
          nextIdRef.current = 1
          setTimeout(() => {
            if (isMounted) runDemo()
          }, 2000)
        }
      }
    }

    runDemo()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAddTodo = () => {
    if (!inputValue.trim()) return

    const newTodo: TodoItem = {
      id: nextIdRef.current++,
      description: inputValue.trim(),
      completed: false,
      priority: 'Medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTodos((prev) => [newTodo, ...prev])
    setInputValue('')
  }

  const handleToggleComplete = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updated_at: new Date().toISOString() }
          : todo
      )
    )
  }

  const handleDelete = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const pendingTodos = todos.filter((todo) => !todo.completed)
  const completedTodos = todos.filter((todo) => todo.completed)

  return (
    <div ref={containerRef} className="relative w-full bg-white/50 p-2 demo-container">
      <div className="max-w-2xl mx-auto px-2">
        {/* Fake Cursor */}
        <AnimatePresence>
          {cursorVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: cursorPosition.x,
                y: cursorPosition.y,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                x: { type: 'spring', stiffness: 500, damping: 30 },
                y: { type: 'spring', stiffness: 500, damping: 30 },
                scale: { duration: 0.2 },
              }}
              className="absolute pointer-events-none z-50"
              style={{
                left: 0,
                top: 0,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                animate={{
                  scale: isClicking ? 0.7 : 1,
                }}
                transition={{ duration: 0.15 }}
                className="w-8 h-8 rounded-full bg-blue-600 border-4 border-white shadow-2xl flex items-center justify-center"
                style={{
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.8)',
                }}
              >
                <motion.div
                  animate={{
                    scale: isClicking ? 1.5 : 0,
                    opacity: isClicking ? [0.7, 0.3, 0] : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    times: [0, 0.5, 1],
                  }}
                  className="absolute w-8 h-8 rounded-full bg-blue-400"
                />
                <div className="w-2 h-2 rounded-full bg-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Redundant header removed as it is now handled by the parent Dialog component */}

        {/* Todo Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAddTodo()
          }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ListTodo className="w-5 h-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a new TODO item..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                maxLength={500}
                readOnly={currentStep !== 'typing'}
                aria-label="TODO item description"
              />
            </div>
            <AceternityButton
              ref={addButtonRef}
              type="submit"
              variant="add"
              disabled={!inputValue.trim()}
              aria-label="Add TODO item"
            >
              <Plus className="w-4 h-4" />
              Add
            </AceternityButton>
          </div>
        </form>

        {/* Todo List */}
        <div className="space-y-4">
          {pendingTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-700">
                Pending ({pendingTodos.length})
              </h2>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {pendingTodos.map((todo, index) => {
                    // Assign refs to the first pending todo that is not completed
                    const isFirstPending = index === 0 && !todo.completed && pendingTodos.length > 0
                    return (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border rounded-lg ${todo.completed
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-300'
                          }`}
                      >
                        <input
                          ref={(el) => {
                            if (isFirstPending && el) {
                              checkboxRef.current = el
                            }
                          }}
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          aria-label={`Mark "${todo.description}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                        />
                        <div className="flex-1">
                          <p
                            className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}
                          >
                            {todo.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${todo.priority === 'High'
                                ? 'bg-red-100 text-red-600'
                                : todo.priority === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'bg-blue-100 text-blue-600'
                                }`}
                            >
                              {todo.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-start">
                          <AceternityButton
                            ref={(el) => {
                              if (isFirstPending && el) {
                                deleteButtonRef.current = el
                              }
                            }}
                            onClick={() => handleDelete(todo.id)}
                            variant="delete"
                            aria-label={`Delete "${todo.description}"`}
                            className="text-sm px-4 py-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </AceternityButton>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {completedTodos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-500">
                Completed ({completedTodos.length})
              </h2>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {completedTodos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border rounded-lg bg-gray-50 border-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleComplete(todo.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        aria-label={`Mark "${todo.description}" as incomplete`}
                      />
                      <div className="flex-1">
                        <p className="line-through text-gray-500">{todo.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${todo.priority === 'High'
                              ? 'bg-red-100 text-red-600'
                              : todo.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-blue-100 text-blue-600'
                              }`}
                          >
                            {todo.priority}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {todos.length === 0 && (
            <div className="text-center py-12 text-gray-500" role="status">
              <p>No TODO items yet. The demo will start shortly...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

