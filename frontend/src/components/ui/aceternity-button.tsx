import * as React from 'react'
import { cn } from '../../lib/utils'

interface AceternityButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'add' | 'edit' | 'delete'
  children: React.ReactNode
}

export const AceternityButton = React.forwardRef<HTMLButtonElement, AceternityButtonProps>(
  ({ className, variant = 'add', children, disabled, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)
    
    const baseStyles = 'relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium transition-all duration-300 rounded-lg group active:scale-95'
    
    const variantStyles = {
      add: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl hover:shadow-blue-500/50',
      edit: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl hover:shadow-purple-500/50',
      delete: 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-xl hover:shadow-red-500/50',
    }

    const disabledStyles = 'opacity-50 cursor-not-allowed active:scale-100'

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          disabled && disabledStyles,
          className
        )}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        {/* Animated shine effect */}
        <span
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent',
            isHovered && !disabled && 'animate-shimmer'
          )}
          style={{
            transform: isHovered && !disabled ? 'translateX(200%)' : 'translateX(-100%)',
            transition: 'transform 0.6s ease-in-out',
          }}
        />
        {/* Ripple effect on click */}
        <span className="absolute inset-0 rounded-lg opacity-0 group-active:opacity-100 group-active:bg-white/20 transition-opacity duration-150" />
      </button>
    )
  }
)
AceternityButton.displayName = 'AceternityButton'
