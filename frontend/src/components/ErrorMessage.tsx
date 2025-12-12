interface ErrorMessageProps {
  message: string | null
  onDismiss?: () => void
}

export const ErrorMessage = ({ message, onDismiss }: ErrorMessageProps) => {
  if (!message) return null

  return (
    <div
      className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
      role="alert"
    >
      <p className="text-red-800">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}
