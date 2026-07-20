import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
  icon?: LucideIcon
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  icon: Icon = AlertTriangle
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/25',
          iconColor: 'text-yellow-500',
          btnBg: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500/50'
        }
      case 'info':
        return {
          bg: 'bg-blue-500/10 border-blue-500/25',
          iconColor: 'text-blue-500',
          btnBg: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/50'
        }
      case 'danger':
      default:
        return {
          bg: 'bg-red-500/10 border-red-500/25',
          iconColor: 'text-red-500',
          btnBg: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={isLoading ? undefined : onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
          >
            <div className="flex gap-4">
              <div className={`h-10 w-10 rounded-full border flex items-center justify-center shrink-0 ${styles.bg}`}>
                <Icon className={`h-5 w-5 ${styles.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground font-sans uppercase tracking-wider">
                  {title}
                </h3>
                <div className="text-xs text-muted-text mt-2 leading-relaxed">
                  {description}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                className="text-[10px] font-mono uppercase tracking-wider h-8 px-4"
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                className={`text-[10px] font-mono uppercase tracking-wider h-8 px-4 text-white rounded-lg transition-colors duration-150 ${styles.btnBg}`}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
