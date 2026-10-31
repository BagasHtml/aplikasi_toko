import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-tag border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted transition-colors',
        'hover:border-muted/60 focus-visible:border-green',
        'aria-[invalid=true]:border-clay aria-[invalid=true]:bg-[#fdf3f1]',
        'disabled:cursor-not-allowed disabled:bg-paper disabled:opacity-60',
        className,
      )}
      {...props}
    />
  )
}
