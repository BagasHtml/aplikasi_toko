import type { ComponentProps } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-tag text-sm font-semibold whitespace-nowrap transition-colors duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default: 'bg-green text-paper hover:bg-[#173d2d]',
        accent: 'bg-turmeric text-ink hover:bg-[#c98c14]',
        outline:
          'border border-line bg-surface text-ink hover:border-green hover:text-green',
        ghost: 'text-ink hover:bg-green-soft',
        danger: 'bg-clay text-white hover:bg-[#983827]',
        link: 'h-auto p-0 text-green underline underline-offset-4 hover:text-ink',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-11 px-3 text-xs sm:h-9',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'
  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
