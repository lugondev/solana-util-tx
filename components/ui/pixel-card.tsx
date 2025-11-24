import {ReactNode} from 'react'
import {cn} from '@/lib/utils'

interface PixelCardProps {
	children: ReactNode
	className?: string
	header?: string | ReactNode
	footer?: ReactNode
}

/**
 * Pixel art styled card component
 * Retro gaming aesthetic with pixel borders and shadows
 */
export function PixelCard({children, className, header, footer}: PixelCardProps) {
	return (
		<div
			className={cn('border-2 p-4 md:p-6', 'shadow-[2px_2px_0_var(--pixel-shadow),4px_4px_0_rgba(0,0,0,0.3)]', 'overflow-hidden', className)}
			style={{
				borderColor: 'var(--pixel-border-primary)',
				backgroundColor: 'var(--pixel-bg-secondary)',
				color: 'var(--pixel-text-primary)',
			}}>
			{header && (
				<div className='border-b-2 pb-3 md:pb-4 mb-4 md:mb-5' style={{borderColor: 'var(--pixel-border-primary)'}}>
					{typeof header === 'string' ? (
						<h3 className='font-pixel text-xs md:text-sm uppercase word-break-word' style={{color: 'var(--pixel-accent)'}}>
							{header}
						</h3>
					) : (
						header
					)}
				</div>
			)}
			<div className='min-w-0'>{children}</div>
			{footer && (
				<div className='border-t-2 pt-3 md:pt-4 mt-4 md:mt-5' style={{borderColor: 'var(--pixel-border-primary)'}}>
					{footer}
				</div>
			)}
		</div>
	)
}
