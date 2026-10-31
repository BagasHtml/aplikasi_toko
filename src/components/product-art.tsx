import { cn } from '@/lib/utils'

type ProductArtProps = {
  art: string
  className?: string
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const accent = {
  fill: 'var(--color-turmeric)',
  fillOpacity: 0.28,
  stroke: 'none',
}

function Art({ art }: { art: string }) {
  switch (art) {
    case 'phone':
      return (
        <>
          <rect x="72" y="18" width="56" height="124" rx="9" {...stroke} />
          <rect x="79" y="30" width="42" height="94" rx="2" {...accent} />
          <path d="M92 22h16" {...stroke} />
          <circle cx="100" cy="133" r="2.6" fill="currentColor" />
          <path d="M128 48v16M128 72v12" {...stroke} />
        </>
      )
    case 'foldable':
      return (
        <>
          <path d="M46 42h46v78H46z" {...stroke} />
          <path d="M92 42h56l-10 78H92z" {...stroke} />
          <path d="M92 42v78" {...stroke} />
          <path d="M58 54h22v54H58z" {...accent} />
          <path d="M104 54h30l-6 54h-24z" {...accent} />
          <circle cx="130" cy="84" r="2.4" fill="currentColor" />
        </>
      )
    case 'scooter':
      return (
        <>
          <circle cx="56" cy="116" r="18" {...stroke} />
          <circle cx="148" cy="116" r="18" {...stroke} />
          <path d="M56 116c2-22 18-34 38-34h10l16-14" {...stroke} />
          <path d="M104 82h30l14 34" {...stroke} />
          <path d="M132 82V58h12" {...stroke} />
          <path d="M78 82h30l-4 14H72" {...accent} />
          <circle cx="154" cy="92" r="4" {...accent} />
          <path d="M56 116h18M148 116h-14" {...stroke} />
        </>
      )
    case 'moped':
      return (
        <>
          <circle cx="54" cy="118" r="17" {...stroke} />
          <circle cx="146" cy="118" r="17" {...stroke} />
          <path d="M54 118c4-18 16-26 30-26h22l20 26" {...stroke} />
          <path d="M84 92h34l8 12" {...stroke} />
          <path d="M118 92V66h12" {...stroke} />
          <path d="M70 74h24v14H70z" {...accent} />
          <path d="M70 74v-8h20" {...stroke} />
          <path d="M54 118h16M146 118h-12" {...stroke} />
        </>
      )
    case 'ricecooker':
      return (
        <>
          <path d="M54 78h92l-8 54H62z" {...stroke} />
          <rect x="60" y="60" width="80" height="18" rx="9" {...stroke} />
          <path d="M72 60c0-14 10-22 28-22s28 8 28 22" {...stroke} />
          <circle cx="100" cy="42" r="4" {...accent} />
          <rect x="84" y="94" width="32" height="16" rx="3" {...accent} />
          <path d="M54 88h92" {...stroke} />
          <circle cx="100" cy="102" r="2.4" fill="currentColor" />
        </>
      )
    case 'fan':
      return (
        <>
          <circle cx="100" cy="66" r="36" {...stroke} />
          <circle cx="100" cy="66" r="6" {...accent} />
          <g {...stroke}>
            <path d="M100 58c12-20 32-8 21 8-8 11-21 8-21-8Z" fill="var(--color-turmeric)" fillOpacity="0.22" />
            <path d="M108 70c20 12 8 32-8 21-11-8-8-21 8-21Z" fill="var(--color-turmeric)" fillOpacity="0.22" />
            <path d="M92 70c-20 12-8 32 8 21 11-8 8-21-8-21Z" fill="var(--color-turmeric)" fillOpacity="0.22" />
          </g>
          <path d="M100 102v28M80 134h40" {...stroke} />
        </>
      )
    case 'tv':
      return (
        <>
          <rect x="32" y="34" width="136" height="86" rx="6" {...stroke} />
          <rect x="41" y="43" width="118" height="68" rx="2" {...accent} />
          <path d="M78 138h44M100 120v18" {...stroke} />
          <circle cx="154" cy="53" r="2.4" fill="currentColor" />
        </>
      )
    case 'laptop':
      return (
        <>
          <path d="M52 36h96v70H52z" {...stroke} />
          <rect x="60" y="44" width="80" height="54" rx="2" {...accent} />
          <path d="M38 120h124l-10 14H48z" {...stroke} />
          <path d="M86 120h28" {...stroke} />
        </>
      )
    case 'blender':
      return (
        <>
          <path d="M74 30h52l-7 66H81z" {...stroke} />
          <path d="M81 96h38v40H81z" {...stroke} />
          <path d="M72 96h56" {...stroke} />
          <rect x="86" y="104" width="28" height="18" rx="3" {...accent} />
          <path d="M94 113h12" {...stroke} />
          <path d="M82 30h36" {...stroke} />
          <path d="M90 46h20" {...stroke} />
        </>
      )
    case 'iron':
      return (
        <>
          <path d="M44 100h112c0 20-14 30-34 30H70c-16 0-26-10-26-30Z" {...stroke} />
          <path d="M44 100h112" {...stroke} />
          <path d="M70 100c0-20 12-32 30-32h20c16 0 26 12 28 32" {...stroke} />
          <path d="M96 68c0-10 6-16 14-16" {...stroke} />
          <path d="M60 110h80" {...accent} />
          <circle cx="142" cy="110" r="2.4" fill="currentColor" />
        </>
      )
    default:
      return (
        <>
          <rect x="62" y="46" width="76" height="70" rx="6" {...stroke} />
          <path d="M76 62h48M76 76h48M76 90h28" {...stroke} />
        </>
      )
  }
}

export function ProductArt({ art, className }: ProductArtProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      className={cn('block', className)}
      role="presentation"
      aria-hidden="true"
    >
      <circle
        cx="100"
        cy="78"
        r="62"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1.4"
      />
      <Art art={art} />
      <path
        d="M40 146h120"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.6"
        strokeDasharray="4 6"
      />
    </svg>
  )
}
