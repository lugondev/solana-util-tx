'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PixelToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

/**
 * Pixel art styled toast notification
 * Auto-dismisses after duration
 */
export function PixelToast({ message, type = 'info', duration = 3000, onClose }: PixelToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const variants = {
    success: 'border-pixel-success text-pixel-success',
    error: 'border-pixel-error text-pixel-error',
    warning: 'border-pixel-warning text-pixel-warning',
    info: 'border-pixel-info text-pixel-info',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div
      className={cn(
        'fixed bottom-8 right-8 z-[9999]',
        'border-4 bg-pixel-bg-secondary px-4 py-3',
        'font-pixel text-[10px]',
        'shadow-[4px_4px_0_var(--pixel-shadow),8px_8px_0_rgba(0,0,0,0.3)]',
        'animate-[pixel-slide-in-right_0.3s_steps(10)]',
        'min-w-[200px] max-w-[400px]',
        variants[type]
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-[16px]">{icons[type]}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-pixel-text-secondary hover:text-pixel-text"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
