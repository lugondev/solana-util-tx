import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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
export function PixelCard({ children, className, header, footer }: PixelCardProps) {
  return (
    <div 
      className={cn(
        'border-4 p-5',
        'shadow-[4px_4px_0_var(--pixel-shadow),8px_8px_0_rgba(0,0,0,0.3)]',
        className
      )}
      style={{
        borderColor: 'var(--pixel-border-primary)',
        backgroundColor: 'var(--pixel-bg-secondary)',
        color: 'var(--pixel-text-primary)'
      }}
    >
      {header && (
        <div 
          className="border-b-4 pb-3 mb-4"
          style={{ borderColor: 'var(--pixel-border-primary)' }}
        >
          {typeof header === 'string' ? (
            <h3 
              className="font-pixel text-[12px] uppercase"
              style={{ color: 'var(--pixel-accent)' }}
            >
              {header}
            </h3>
          ) : (
            header
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div 
          className="border-t-4 pt-3 mt-4"
          style={{ borderColor: 'var(--pixel-border-primary)' }}
        >
          {footer}
        </div>
      )}
    </div>
  )
}
