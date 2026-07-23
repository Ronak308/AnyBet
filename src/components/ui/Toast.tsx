import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'warning' | 'info'

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

// Global helper object to show toast
export const showToast = (message: string, type: ToastType = 'info') => {
  window.dispatchEvent(
    new CustomEvent('app-show-toast', {
      detail: { message, type }
    })
  )
}

export const toast = {
  success: (msg: string) => showToast(msg, 'success'),
  error: (msg: string) => showToast(msg, 'warning'),
  info: (msg: string) => showToast(msg, 'info')
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: ToastType }>
      if (!customEvent.detail || !customEvent.detail.message) return
      
      const newToastMessage = customEvent.detail.message
      const newToastType = customEvent.detail.type || 'info'
      
      setToasts(prev => {
        // Prevent duplicate toast with identical message and type from appearing simultaneously
        if (prev.some(t => t.message === newToastMessage && t.type === newToastType)) {
          return prev
        }
        return [
          ...prev,
          {
            id: `${Date.now()}_${Math.random()}`,
            message: newToastMessage,
            type: newToastType
          }
        ]
      })
    }

    window.addEventListener('app-show-toast', handleToastEvent)
    window.addEventListener('show-toast', handleToastEvent)

    return () => {
      window.removeEventListener('app-show-toast', handleToastEvent)
      window.removeEventListener('show-toast', handleToastEvent)
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-3 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={(id) => setToasts(prev => prev.filter(x => x.id !== id))} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 3500)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  const iconMap = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />,
    info: <Info className="h-4 w-4 text-primary shrink-0" />
  }

  const borderMap = {
    success: 'border-emerald-500/30',
    warning: 'border-red-500/30',
    info: 'border-primary/30'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.15 } }}
      layout
      className={`p-3.5 rounded-xl border ${borderMap[toast.type]} shadow-glow bg-card/95 backdrop-blur-md flex items-center gap-3 select-none pointer-events-auto cursor-pointer`}
      onClick={() => onDismiss(toast.id)}
    >
      {iconMap[toast.type]}
      <span className="text-xs font-mono text-foreground font-semibold uppercase tracking-wider">
        {toast.message}
      </span>
    </motion.div>
  )
}
