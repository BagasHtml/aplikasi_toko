import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertIcon, ReceiptIcon, TrashIcon } from '@/components/icons'
import { ProductArt } from '@/components/product-art'
import { QtyStepper } from '@/components/qty-stepper'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError, listProducts } from '@/lib/api'
import { formatRupiah } from '@/lib/format'
import { useCart } from '@/store/use-cart'

export function CartPage() {
  const {
    lines,
    count,
    subtotal,
    setQty,
    remove,
    clear,
    reconcile,
    clampToStock,
  } = useCart()
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (lines.length === 0) {
      setLoading(false)
      return
    }

    listProducts()
      .then((data) => {
        if (cancelled) return
        const found = reconcile(data.products)
        if (found.length > 0) {
          setNotice(
            `Stok berubah untuk ${found.length} barang. Periksa jumlahnya sebelum checkout.`,
          )
        }
        setLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setSyncError(
          error instanceof ApiError
            ? error.message
            : 'Stok tidak bisa diperbarui karena kesalahan tak terduga.',
        )
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // Sinkronisasi sengaja hanya saat halaman dibuka, bukan setiap keranjang berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const conflicts = lines.filter(
    (line) => line.product.stock <= 0 || line.qty > line.product.stock,
  )

  function handleFix() {
    const result = clampToStock()
    if (result.adjusted === 0 && result.removed === 0) {
      setNotice('Tidak ada jumlah yang perlu disesuaikan.')
      return
    }
    const parts: string[] = []
    if (result.adjusted > 0) {
      parts.push(`${result.adjusted} jumlah disesuaikan ke sisa stok`)
    }
    if (result.removed > 0) {
      parts.push(`${result.removed} barang dihapus karena stok habis`)
    }
    setNotice(`${parts.join(', ')}.`)
  }

  if (lines.length === 0) {
    return (
      <main id="konten" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <p className="text-xs font-semibold text-muted">Langkah 1 dari 2</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
          Keranjang
        </h1>
        {notice ? (
          <div
            role="status"
            className="mt-6 flex gap-3 rounded-card border border-turmeric/50 bg-[#f8eccd] px-4 py-3 text-sm text-[#7a5306]"
          >
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{notice}</p>
          </div>
        ) : null}
        <div className="mt-8 rounded-panel border border-line bg-surface p-8 text-center sm:p-12 lg:p-14">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-tag border border-line bg-paper text-muted">
            <ReceiptIcon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold">
            Keranjang masih kosong
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            Tambahkan barang dari katalog dulu. Setiap barang punya sisa stok
            yang bisa kamu periksa sebelum checkout.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/katalog">Lihat katalog</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pesanan">Cek pesanan</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main id="konten" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted">Langkah 1 dari 2</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Keranjang
          </h1>
          <p className="mt-1 text-sm text-muted">
            {count} barang. Periksa jumlah sebelum lanjut ke pembayaran.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfirmClearOpen(true)}
        >
          <TrashIcon className="h-4 w-4" />
          Kosongkan keranjang
        </Button>
      </div>

      {syncError ? (
        <div
          role="alert"
          className="mt-5 flex gap-2 rounded-tag border border-clay/30 bg-[#fdf3f1] px-4 py-3 text-sm text-clay"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Stok tidak bisa diperbarui</p>
            <p className="mt-1 text-ink">{syncError}</p>
            <p className="mt-1 text-xs text-muted">
              Kamu masih bisa lanjut checkout. Server tetap menolak pesanan kalau
              stok sudah habis.
            </p>
          </div>
        </div>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="mt-5 rounded-tag border border-line bg-surface px-4 py-3 text-sm text-ink"
        >
          {notice}
        </p>
      ) : null}

      {conflicts.length > 0 ? (
        <div
          role="alert"
          className="mt-5 rounded-card border border-turmeric/50 bg-[#f8eccd] p-4"
        >
          <div className="flex gap-3">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#7a5306]" />
            <div>
              <p className="font-semibold text-[#7a5306]">
                Stok berubah sejak barang masuk keranjang
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink">
                {conflicts.map((line) => (
                  <li key={line.product.id}>
                    {line.product.name}: diminta {line.qty}{' '}
                    {line.product.unit}, tersedia {line.product.stock}{' '}
                    {line.product.unit}.
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={handleFix}
              >
                Sesuaikan otomatis
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start lg:gap-8">
        <div>
          {loading ? (
            <div
              className="space-y-3 rounded-panel border border-line bg-surface p-4"
              aria-busy="true"
            >
              <p className="sr-only">Memeriksa stok terbaru...</p>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface">
              {lines.map((line) => (
                <li
                  key={line.product.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center lg:p-5"
                >
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-tag border border-line bg-[#eee7d6]">
                      <ProductArt
                        art={line.product.art}
                        className="h-full w-full p-2 text-ink"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/produk/${line.product.id}`}
                        className="inline-flex min-h-11 items-center font-display text-lg leading-snug font-semibold transition-colors hover:text-green"
                      >
                        {line.product.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {line.product.category},{' '}
                        {formatRupiah(line.product.price)} per{' '}
                        {line.product.unit}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <QtyStepper
                          compact
                          value={line.qty}
                          max={Math.max(line.product.stock, 1)}
                          onChange={(value) =>
                            setQty(line.product.id, value)
                          }
                          label={line.product.name}
                          disabled={line.product.stock <= 0}
                        />
                        <button
                          type="button"
                          onClick={() => remove(line.product.id)}
                          className="inline-flex h-11 items-center gap-1.5 rounded-tag px-2.5 text-xs font-semibold text-muted transition-colors hover:bg-[#f9ece8] hover:text-clay"
                          aria-label={`Hapus ${line.product.name} dari keranjang`}
                        >
                          <TrashIcon className="h-4 w-4" />
                          Hapus
                        </button>
                      </div>

                      {line.product.stock <= 0 ? (
                        <p className="mt-2 text-xs font-semibold text-clay">
                          Stok habis. Hapus barang ini untuk melanjutkan.
                        </p>
                      ) : line.qty >= line.product.stock ? (
                        <p className="mt-2 text-xs text-muted">
                          Sudah di jumlah maksimum, sisa {line.product.stock}{' '}
                          {line.product.unit}.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3 sm:w-36 sm:flex-col sm:items-end">
                    <p className="price text-lg font-semibold">
                      {formatRupiah(line.product.price * line.qty)}
                    </p>
                    <p className="price text-xs text-muted">
                      {line.qty} x {formatRupiah(line.product.price)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="nota-panel p-5 lg:p-6">
            <h2 className="font-display text-lg font-semibold lg:text-xl">
              Ringkasan
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted">Jumlah barang</dt>
                <dd className="price">{count} barang</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted">Subtotal</dt>
                <dd className="price">{formatRupiah(subtotal)}</dd>
              </div>
            </dl>
            <div className="nota-rule mt-3 flex items-baseline justify-between gap-3 pt-3">
              <span className="font-semibold">Total</span>
              <span className="price text-xl font-semibold lg:text-2xl">
                {formatRupiah(subtotal)}
              </span>
            </div>

            {conflicts.length > 0 ? (
              <Button className="mt-4 w-full" size="lg" disabled>
                Perbaiki jumlah dulu
              </Button>
            ) : (
              <Button asChild className="mt-4 w-full" size="lg">
                <Link to="/checkout">Lanjut ke checkout</Link>
              </Button>
            )}

            <p className="mt-3 text-xs leading-relaxed text-muted">
              Belum ada pembayaran di langkah ini. Stok baru dikurangi setelah
              pesanan dibuat di halaman checkout.
            </p>
          </div>
        </aside>
      </div>

      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kosongkan keranjang?</DialogTitle>
            <DialogDescription>
              Semua barang akan dihapus dari keranjang. Tindakan ini tidak bisa
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmClearOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                clear()
                setConfirmClearOpen(false)
              }}
            >
              Ya, kosongkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
