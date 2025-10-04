'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

/**
 * Pixel art styled button component
 * Supports multiple variants and sizes with retro gaming aesthetic
 */
export function PixelButton({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className,
  disabled,
  ...props
}: PixelButtonProps) {
  const baseStyles = 'font-pixel inline-block border-4 transition-none relative uppercase cursor-pointer'
  
  const sizes = {
    sm: 'text-[8px] px-3 py-2',
    md: 'text-[10px] px-4 py-3',
    lg: 'text-[12px] px-5 py-4'
  }
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          borderColor: 'var(--pixel-accent)',
          backgroundColor: 'var(--pixel-bg-secondary)',
          color: 'var(--pixel-accent)',
          boxShadow: '4px 4px 0 var(--pixel-accent-dark), 8px 8px 0 var(--pixel-shadow)'
        }
      case 'secondary':
        return {
          borderColor: 'var(--pixel-border-primary)',
          backgroundColor: 'var(--pixel-bg-tertiary)',
          color: 'var(--pixel-text-primary)',
          boxShadow: '4px 4px 0 var(--pixel-border-secondary), 8px 8px 0 var(--pixel-shadow)'
        }
      case 'danger':
        return {
          borderColor: 'var(--pixel-error)',
          backgroundColor: 'var(--pixel-bg-secondary)',
          color: 'var(--pixel-error)',
          boxShadow: '4px 4px 0 #cc0044, 8px 8px 0 var(--pixel-shadow)'
        }
      case 'success':
        return {
          borderColor: 'var(--pixel-success)',
          backgroundColor: 'var(--pixel-bg-secondary)',
          color: 'var(--pixel-success)',
          boxShadow: '4px 4px 0 var(--pixel-accent-dark), 8px 8px 0 var(--pixel-shadow)'
        }
    }
  }
  
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return
    
    switch (variant) {
      case 'primary':
        e.currentTarget.style.backgroundColor = 'var(--pixel-accent)'
        e.currentTarget.style.color = 'var(--pixel-bg-primary)'
        e.currentTarget.style.boxShadow = '4px 4px 0 var(--pixel-accent-bright), 8px 8px 0 var(--pixel-accent-dim)'
        break
      case 'secondary':
        e.currentTarget.style.borderColor = 'var(--pixel-text-secondary)'
        break
      case 'danger':
        e.currentTarget.style.backgroundColor = 'var(--pixel-error)'
        e.currentTarget.style.color = 'white'
        break
      case 'success':
        e.currentTarget.style.backgroundColor = 'var(--pixel-success)'
        e.currentTarget.style.color = 'var(--pixel-bg-primary)'
        break
    }
  }
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return
    
    const styles = getVariantStyles()
    Object.assign(e.currentTarget.style, styles)
  }
  
  return (
    <button
      className={cn(
        baseStyles,
        sizes[size],
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={getVariantStyles()}
      disabled={disabled || isLoading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block">
          LOADING<span className="animate-pulse">...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
