import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-11 w-full rounded-tag border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted transition-colors',
        'hover:border-muted/60 focus-visible:border-green',
        'aria-[invalid=true]:border-clay aria-[invalid=true]:bg-[#fdf3f1]',
        'disabled:cursor-not-allowed disabled:bg-paper disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
