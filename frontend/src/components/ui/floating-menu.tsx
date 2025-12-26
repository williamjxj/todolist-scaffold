import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

export interface FloatingMenuOption {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  className?: string
}

export interface FloatingMenuProps {
  options: FloatingMenuOption[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  size?: 'sm' | 'md' | 'lg'
  mainButtonIcon?: React.ReactNode
  mainButtonClassName?: string
  optionClassName?: string
}

const sizeConfig = {
  sm: {
    main: 'w-14 h-14',
    option: 'w-12 h-12',
    icon: 'w-5 h-5',
  },
  md: {
    main: 'w-16 h-16',
    option: 'w-12 h-12',
    icon: 'w-5 h-5',
  },
  lg: {
    main: 'w-20 h-20',
    option: 'w-16 h-16',
    icon: 'w-7 h-7',
  },
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  options,
  position = 'bottom-right',
  size = 'md',
  mainButtonIcon,
  mainButtonClassName,
  optionClassName,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const config = sizeConfig[size]

  // Calculate positions for items in a quarter circle (25% of full circle)
  const getQuarterCirclePosition = (index: number, total: number, radius: number = 90) => {
    // Quarter circle spans 90 degrees (25% of 360°)
    // For bottom-right position: items appear in Top-Left quadrant (180° to 270°)
    // For bottom-left position: items appear in Top-Right quadrant (270° to 360°)
    // For top-right position: items appear in Bottom-Left quadrant (90° to 180°)
    // For top-left position: items appear in Bottom-Right quadrant (0° to 90°)

    let startAngle: number
    let endAngle: number

    if (position === 'bottom-right') {
      // Top-Left quadrant: 180° (Left) to 270° (Top)
      startAngle = 180
      endAngle = 270
    } else if (position === 'bottom-left') {
      // Top-Right quadrant: 270° (Top) to 360° (Right)
      startAngle = 270
      endAngle = 360
    } else if (position === 'top-right') {
      // Bottom-Left quadrant: 90° (Bottom) to 180° (Left)
      startAngle = 90
      endAngle = 180
    } else {
      // top-left: Bottom-Right quadrant: 0° (Right) to 90° (Bottom)
      startAngle = 0
      endAngle = 90
    }

    const angleRange = endAngle - startAngle
    const angleStep = total > 1 ? angleRange / (total - 1) : 0
    const angle = startAngle + angleStep * index

    const radian = (angle * Math.PI) / 180
    // Math.cos(radian) is X
    // Math.sin(radian) is Y. 
    // In CSS coordinate system, Y+ is DOWN.
    // In standard math circle, Y+ is UP.
    // So we need to negate Y to map it correctly if we want 270° to be Top (-Y).
    // Actually, if we use 270 for TOP, sin(270) = -1. So y = -radius, which is UP in CSS.
    // sin(90) = 1. So y = radius, which is DOWN in CSS.
    // This matches naturally!
    const x = Math.cos(radian) * radius
    const y = Math.sin(radian) * radius

    return { x, y, angle }
  }

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      // Use a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (option: FloatingMenuOption) => {
    option.onClick()
    setIsOpen(false)
  }

  return (
    <div
      ref={menuRef}
      className={cn('fixed z-50', positionClasses[position])}
      style={{ position: 'fixed' }}
    >
      {/* Menu Options - Quarter Circle Layout (25% circle on left side) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {options.map((option, index) => {
              // Radius of 110px for better spacing and visual appeal
              const pos = getQuarterCirclePosition(index, options.length, 110)
              return (
                <motion.div
                  key={option.id}
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    delay: index * 0.08,
                  }}
                  className="absolute pointer-events-auto"
                  style={{
                    left: `calc(50% + ${pos.x}px)`,
                    top: `calc(50% + ${pos.y}px)`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 60,
                    willChange: 'transform',
                  }}
                >
                  <div className="relative group">
                    <motion.button
                      onClick={() => handleOptionClick(option)}
                      className={cn(
                        'rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl',
                        'border border-gray-100 hover:border-purple-200',
                        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                        'flex items-center justify-center',
                        'transition-all duration-300',
                        config.option,
                        optionClassName,
                        option.className
                      )}
                      whileHover={{
                        scale: 1.15,
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {option.icon && (
                        <div className={cn(config.icon, '[&>svg]:stroke-gray-700 hover:[&>svg]:stroke-purple-600 [&>svg]:transition-colors')}>
                          {option.icon}
                        </div>
                      )}
                    </motion.button>

                    {/* Tooltip */}
                    <div
                      className={cn(
                        "absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                        "px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium whitespace-nowrap shadow-xl",
                        "z-[70]",
                        position === 'bottom-right' && "mr-3 right-full top-1/2 -translate-y-1/2",
                        position === 'bottom-left' && "ml-3 left-full top-1/2 -translate-y-1/2",
                        position === 'top-right' && "mr-3 right-full top-1/2 -translate-y-1/2",
                        position === 'top-left' && "ml-3 left-full top-1/2 -translate-y-1/2"
                      )}
                    >
                      {option.label}
                      {/* Arrow */}
                      <div className={cn(
                        "absolute w-2 h-2 bg-gray-900 rotate-45",
                        position === 'bottom-right' && "left-full -ml-1 top-1/2 -translate-y-1/2",
                        position === 'bottom-left' && "right-full -mr-1 top-1/2 -translate-y-1/2",
                        position === 'top-right' && "left-full -ml-1 top-1/2 -translate-y-1/2",
                        position === 'top-left' && "right-full -mr-1 top-1/2 -translate-y-1/2"
                      )} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation()
          toggleMenu()
        }}
        className={cn(
          'rounded-full bg-purple-600 hover:bg-purple-700',
          'shadow-lg hover:shadow-xl transition-shadow',
          'flex items-center justify-center',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          'text-white relative overflow-hidden',
          'z-50',
          config.main,
          mainButtonClassName
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{
            rotate: isOpen ? 0 : 0,
            opacity: isOpen ? 0 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          className={cn('absolute flex items-center justify-center', isOpen && 'hidden')}
        >
          {mainButtonIcon || (
            <Plus className={cn('w-6 h-6', size === 'sm' && 'w-5 h-5', size === 'lg' && 'w-8 h-8')} />
          )}
        </motion.div>
        <motion.div
          animate={{
            rotate: isOpen ? 0 : 0,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          className={cn('absolute flex items-center justify-center', !isOpen && 'hidden')}
        >
          <X className={cn('w-6 h-6', size === 'sm' && 'w-5 h-5', size === 'lg' && 'w-8 h-8')} />
        </motion.div>
      </motion.button>
    </div>
  )
}

