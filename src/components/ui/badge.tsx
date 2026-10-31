import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-tag border px-2 py-1 text-xs font-semibold leading-none',
  {
    variants: {
      variant: {
        stock: 'border-green/20 bg-green-soft text-green',
        empty: 'border-clay/25 bg-[#f9ece8] text-clay',
        low: 'border-turmeric/40 bg-[#f8eccd] text-[#7a5306]',
        category: 'border-line bg-paper text-muted',
        plain: 'border-line bg-surface text-ink',
      },
    },
    defaultVariants: {
      variant: 'plain',
    },
  },
)

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
