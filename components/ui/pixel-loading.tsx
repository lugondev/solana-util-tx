'use client'

import { cn } from '@/lib/utils'

interface PixelLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

/**
 * Pixel art styled loading spinner
 * Uses stepped animation for retro effect
 */
export function PixelLoading({ size = 'md', text, className }: PixelLoadingProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          'border-pixel-border border-t-pixel-accent rounded-none',
          'animate-[pixel-spin_1s_steps(8)_infinite]',
          sizes[size]
        )}
      />
      {text && (
        <p className="font-pixel text-[10px] text-pixel-text-secondary">
          {text}
          <span className="animate-pulse">...</span>
        </p>
      )}
    </div>
  )
}

interface PixelProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
}

/**
 * Pixel art styled progress bar
 * Shows progress with animated stripes
 */
export function PixelProgressBar({ value, max = 100, className, showLabel = true }: PixelProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between font-mono text-[10px] text-pixel-text-secondary">
          <span>PROGRESS</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-6 border-4 border-pixel-border bg-pixel-bg-primary relative overflow-hidden">
        <div
          className="h-full bg-pixel-accent transition-[width] duration-300"
          style={{ 
            width: `${percentage}%`,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              var(--pixel-accent),
              var(--pixel-accent) 8px,
              var(--pixel-accent-bright) 8px,
              var(--pixel-accent-bright) 16px
            )`
          }}
        />
      </div>
    </div>
  )
}
