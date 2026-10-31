import type { ComponentProps } from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '@/lib/utils'

export function RadioGroup({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2.5', className)}
      {...props}
    />
  )
}

export function RadioGroupItem({
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-surface transition-colors',
        'data-[state=checked]:border-green',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="block h-2.5 w-2.5 rounded-full bg-green" />
    </RadioGroupPrimitive.Item>
  )
}
