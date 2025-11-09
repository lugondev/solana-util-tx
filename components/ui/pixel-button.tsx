'use client'

import {ButtonHTMLAttributes, ReactNode} from 'react'
import {cn} from '@/lib/utils'

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
export function PixelButton({variant = 'primary', size = 'md', children, isLoading = false, className, disabled, ...props}: PixelButtonProps) {
	const baseStyles = 'font-pixel inline-flex items-center justify-center gap-2 border-4 transition-none relative uppercase cursor-pointer word-break-word'

	const sizes = {
		sm: 'text-[10px] md:text-xs px-3 md:px-4 py-2 md:py-3 min-h-[40px] md:min-h-[44px]',
		md: 'text-xs md:text-sm px-4 md:px-6 py-3 md:py-4 min-h-[44px] md:min-h-[48px]',
		lg: 'text-sm md:text-base px-5 md:px-8 py-4 md:py-5 min-h-[48px] md:min-h-[52px]',
	}

	const getVariantStyles = () => {
		switch (variant) {
			case 'primary':
				return {
					borderColor: 'var(--pixel-accent)',
					backgroundColor: 'var(--pixel-bg-secondary)',
					color: 'var(--pixel-accent)',
					boxShadow: '4px 4px 0 var(--pixel-accent-dark), 8px 8px 0 var(--pixel-shadow)',
				}
			case 'secondary':
				return {
					borderColor: 'var(--pixel-border-primary)',
					backgroundColor: 'var(--pixel-bg-tertiary)',
					color: 'var(--pixel-text-primary)',
					boxShadow: '4px 4px 0 var(--pixel-border-secondary), 8px 8px 0 var(--pixel-shadow)',
				}
			case 'danger':
				return {
					borderColor: 'var(--pixel-error)',
					backgroundColor: 'var(--pixel-bg-secondary)',
					color: 'var(--pixel-error)',
					boxShadow: '4px 4px 0 #cc0044, 8px 8px 0 var(--pixel-shadow)',
				}
			case 'success':
				return {
					borderColor: 'var(--pixel-success)',
					backgroundColor: 'var(--pixel-bg-secondary)',
					color: 'var(--pixel-success)',
					boxShadow: '4px 4px 0 var(--pixel-accent-dark), 8px 8px 0 var(--pixel-shadow)',
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
		<button className={cn(baseStyles, sizes[size], (disabled || isLoading) && 'opacity-50 cursor-not-allowed', className)} style={getVariantStyles()} disabled={disabled || isLoading} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
			{isLoading ? (
				<span className='inline-block'>
					LOADING<span className='animate-pulse'>...</span>
				</span>
			) : (
				children
			)}
		</button>
	)
}
