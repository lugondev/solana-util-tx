'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

/**
 * Pixel art styled input component
 * Monospace font with retro gaming aesthetic
 */
export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="font-pixel text-[10px] uppercase block" style={{ color: 'var(--pixel-text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'font-mono text-[12px] w-full px-3 py-3',
            'border-4 transition-none',
            'shadow-[inset_2px_2px_0_rgba(0,0,0,0.3)]',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error ? 'border-red-500' : 'border-gray-600',
            className
          )}
          style={{
            backgroundColor: 'var(--pixel-input-bg)',
            color: 'var(--pixel-text-primary)',
            borderColor: error ? 'var(--pixel-error)' : 'var(--pixel-input-border)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--pixel-input-focus)'
            e.target.style.boxShadow = 'inset 2px 2px 0 rgba(0,255,65,0.1), 0 0 0 2px var(--pixel-accent-dark)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--pixel-error)' : 'var(--pixel-input-border)'
            e.target.style.boxShadow = 'inset 2px 2px 0 rgba(0,0,0,0.3)'
          }}
          {...props}
        />
        {error && (
          <p className="font-mono text-[10px]" style={{ color: 'var(--pixel-error)' }}>
            ❌ {error}
          </p>
        )}
        {helperText && !error && (
          <p className="font-mono text-[10px]" style={{ color: 'var(--pixel-text-quaternary)' }}>
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

PixelInput.displayName = 'PixelInput'
