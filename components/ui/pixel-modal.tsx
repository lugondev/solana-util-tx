'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PixelModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Pixel art styled modal component
 * Retro gaming aesthetic with overlay and animations
 */
export function PixelModal({ isOpen, onClose, children, title, size = 'md' }: PixelModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[999]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'border-4 border-pixel-accent bg-pixel-bg-secondary p-6 z-[1000]',
          'shadow-[8px_8px_0_var(--pixel-shadow),16px_16px_0_rgba(0,0,0,0.5)]',
          'w-[90%]',
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex justify-between items-center mb-4 pb-3 border-b-4 border-pixel-border">
            <h2 className="font-pixel text-[14px] text-pixel-accent uppercase">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="font-pixel text-[14px] text-pixel-error hover:text-pixel-error border-4 border-pixel-error px-2 py-1 hover:bg-pixel-error hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Content */}
        <div>{children}</div>
      </div>
    </>
  )
}
