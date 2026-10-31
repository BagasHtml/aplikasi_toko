import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-tag bg-line/45', className)}
      aria-hidden="true"
      {...props}
    />
  )
}
