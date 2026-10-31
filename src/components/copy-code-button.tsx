import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CopyIcon } from '@/components/icons'
import { copyText } from '@/lib/clipboard'
import { cn } from '@/lib/utils'

type CopyState = 'idle' | 'copied' | 'failed'

export function CopyCodeButton({
  code,
  className,
}: {
  code: string
  className?: string
}) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function handleCopy() {
    window.clearTimeout(timer.current)
    const copied = await copyText(code)
    setState(copied ? 'copied' : 'failed')
    timer.current = window.setTimeout(() => setState('idle'), 2400)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 rounded-tag px-2.5 text-xs font-semibold transition-colors',
        state === 'failed'
          ? 'text-clay hover:bg-[#f9ece8]'
          : 'text-green hover:bg-green-soft',
        className,
      )}
      aria-label={`Salin kode nota ${code}`}
    >
      {state === 'copied' ? (
        <CheckIcon className="h-3.5 w-3.5" />
      ) : (
        <CopyIcon className="h-3.5 w-3.5" />
      )}
      {state === 'copied'
        ? 'Tersalin'
        : state === 'failed'
          ? 'Gagal salin'
          : 'Salin kode'}
      <span role="status" className="sr-only">
        {state === 'copied'
          ? 'Kode nota tersalin.'
          : state === 'failed'
            ? 'Kode nota gagal disalin.'
            : ''}
      </span>
    </button>
  )
}
