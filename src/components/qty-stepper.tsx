import { useEffect, useId, useState } from 'react'
import { MinusIcon, PlusIcon } from '@/components/icons'
import { cn } from '@/lib/utils'

type QtyStepperProps = {
  value: number
  max: number
  onChange: (value: number) => void
  label: string
  disabled?: boolean
  compact?: boolean
  describedBy?: string
}

export function QtyStepper({
  value,
  max,
  onChange,
  label,
  disabled = false,
  compact = false,
  describedBy,
}: QtyStepperProps) {
  const inputId = useId()
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const atMax = value >= max
  const atMin = value <= 1

  function commit(raw: string) {
    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
      setDraft('1')
      onChange(1)
      return
    }
    if (parsed > max) {
      setDraft(String(max))
      onChange(max)
      return
    }
    setDraft(String(parsed))
    onChange(parsed)
  }

  const buttonSize = compact ? 'h-11 w-11 sm:h-9 sm:w-9' : 'h-11 w-11'

  return (
    <div
      className={cn(
        'inline-flex items-stretch overflow-hidden rounded-tag border border-line bg-surface',
        disabled && 'opacity-55',
      )}
    >
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center text-ink transition-colors hover:bg-green-soft disabled:cursor-not-allowed disabled:text-muted/50',
          buttonSize,
        )}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || atMin}
        aria-label={`Kurangi jumlah ${label}`}
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <label htmlFor={inputId} className="sr-only">
        {`Jumlah ${label}`}
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        onChange={(event) => setDraft(event.target.value.replace(/[^0-9]/g, ''))}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit(event.currentTarget.value)
          }
        }}
        disabled={disabled}
        aria-describedby={describedBy}
        className={cn(
          'price border-x border-line bg-surface text-center text-sm font-semibold text-ink outline-none disabled:cursor-not-allowed',
          compact ? 'w-10' : 'w-14',
        )}
      />
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center text-ink transition-colors hover:bg-green-soft disabled:cursor-not-allowed disabled:text-muted/50',
          buttonSize,
        )}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || atMax}
        aria-label={`Tambah jumlah ${label}`}
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
