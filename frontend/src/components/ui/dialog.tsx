import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface DialogProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title?: string
    className?: string
}

export const Dialog = ({ isOpen, onClose, children, title, className }: DialogProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-gray-950/40 backdrop-blur-sm"
                    />

                    {/* Dialog Container */}
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={cn(
                                "w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col border border-gray-100",
                                className
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                                    aria-label="Close dialog"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
