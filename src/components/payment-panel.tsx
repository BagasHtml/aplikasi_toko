import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { formatRupiah } from '@/lib/format'

export function TransferPanel() {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <p className="text-sm font-semibold">Instruksi transfer</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-muted">Bank</dt>
          <dd>Bank BCA</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-muted">Nomor rekening</dt>
          <dd className="price">2431837421</dd>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <dt className="text-muted">Atas nama</dt>
          <dd>BelanjaKu</dd>
        </div>
      </dl>
      <p className="nota-rule mt-3 pt-3 text-xs leading-relaxed text-muted">
        Cantumkan kode pesanan pada berita transfer. Toko mengonfirmasi
        pembayaran secara manual.
      </p>
    </div>
  )
}

export function QrisPanel({ total, code }: { total: number; code?: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setDataUrl(null)
    setFailed(false)
    const payload = `BELANJAKU|TOTAL=${total}${code ? `|PESANAN=${code}` : ''}`
    QRCode.toDataURL(payload, {
      margin: 1,
      width: 320,
      color: { dark: '#17251E', light: '#FFFCF5' },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [total, code, attempt])

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-tag border border-line bg-paper p-2">
          {failed ? (
            <p className="px-2 text-center text-xs text-clay">
              Kode QR gagal dibuat.
            </p>
          ) : dataUrl ? (
            <img
              src={dataUrl}
              alt="Kode QR QRIS pesanan"
              className="h-full w-full"
            />
          ) : (
            <p className="px-2 text-center text-xs text-muted">
              Menyiapkan kode QR...
            </p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">QRIS</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Pindai kode ini untuk membayar {formatRupiah(total)}.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Cocokkan nominal sebelum memindai. Pembayaran dikonfirmasi manual
            oleh toko.
          </p>
          {failed ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Coba buat ulang
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
