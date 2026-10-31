import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { CopyCodeButton } from '@/components/copy-code-button'
import { ArrowLeftIcon, ReceiptIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError, getOrder } from '@/lib/api'
import { formatDateTime, formatRupiah } from '@/lib/format'
import type { Order } from '@/lib/types'

type LoadError = {
  notFound: boolean
  message: string
}

function paymentLabel(payment: Order['payment']) {
  return payment === 'transfer' ? 'Transfer bank' : 'QRIS'
}

function OrderQr({ code }: { code: string }) {
  const [source, setSource] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setSource(null)
    setFailed(false)
    const url = `${window.location.origin}/pesanan/${encodeURIComponent(code)}`
    QRCode.toDataURL(url, {
      margin: 1,
      width: 240,
      color: { dark: '#17251E', light: '#FFFCF5' },
    })
      .then((value) => {
        if (!cancelled) setSource(value)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [code])

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-tag border border-line bg-paper p-1.5">
      {failed ? (
        <p className="px-1 text-center text-[10px] leading-snug text-clay">
          Kode QR gagal dibuat.
        </p>
      ) : source ? (
        <img
          src={source}
          alt={`Kode QR untuk membuka pesanan ${code}`}
          className="h-full w-full"
        />
      ) : (
        <p className="px-1 text-center text-[10px] leading-snug text-muted">
          Menyiapkan QR...
        </p>
      )}
    </div>
  )
}

function ProofSkeleton() {
  return (
    <main
      id="konten"
      tabIndex={-1}
      className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12"
      aria-busy="true"
    >
      <p className="sr-only">Memuat bukti pembelian...</p>
      <Skeleton className="h-4 w-40" />
      <div className="mt-5 rounded-panel border border-line bg-surface p-6 sm:p-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
        <Skeleton className="mt-6 h-24 w-full" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    </main>
  )
}

export function PurchaseProofPage() {
  const { code: rawCode = '' } = useParams()
  const code = rawCode.trim().toUpperCase()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<LoadError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getOrder(code)
      .then((data) => {
        if (cancelled) return
        setOrder(data.order)
        setError(null)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setError({
          notFound: cause instanceof ApiError && cause.status === 404,
          message:
            cause instanceof ApiError
              ? cause.message
              : 'Bukti pembelian gagal dimuat karena kesalahan tak terduga.',
        })
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [code, reloadKey])

  if (!order) {
    if (loading) return <ProofSkeleton />

    return (
      <main
        id="konten"
        tabIndex={-1}
        className="mx-auto flex min-h-[60dvh] max-w-2xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:py-20"
      >
        <p className="text-sm font-semibold text-clay">
          {error?.notFound ? 'Pesanan tidak ditemukan' : 'Bukti gagal dimuat'}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          {error?.notFound
            ? 'Kode pesanan ini tidak tercatat.'
            : 'Bukti pembelian belum bisa dibuka.'}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {error?.message ??
            'Tidak ada data pesanan yang bisa ditampilkan. Periksa kembali kode pesanan.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {!error?.notFound ? (
            <Button
              variant="outline"
              onClick={() => {
                setError(null)
                setLoading(true)
                setReloadKey((key) => key + 1)
              }}
            >
              Coba lagi
            </Button>
          ) : (
            <Button asChild>
              <Link to="/pesanan">Cek kode lain</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/katalog">Kembali ke katalog</Link>
          </Button>
        </div>
      </main>
    )
  }

  const totalQty = order.items.reduce((sum, item) => sum + item.qty, 0)
  const label = paymentLabel(order.payment)

  return (
    <main
      id="konten"
      tabIndex={-1}
      className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12 print:max-w-none print:px-0 print:py-0"
    >
      <Link
        to={`/pesanan/${order.code}`}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-green print:hidden"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke rincian pesanan
      </Link>

      <article
        aria-labelledby="judul-bukti"
        className="nota-panel mt-2 p-6 sm:p-8 lg:p-10 print:mt-0 print:border-line print:shadow-none"
      >
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl leading-none font-semibold tracking-tight">
              BelanjaKu
            </p>
            <h1
              id="judul-bukti"
              className="mt-2 font-display text-3xl font-semibold sm:text-4xl"
            >
              Bukti pembelian
            </h1>
            <p className="price mt-1 text-xs text-muted">{order.code}</p>
            <CopyCodeButton code={order.code} className="print:hidden" />
          </div>
          <span className="inline-flex -rotate-2 items-center gap-2 rounded-tag border-2 border-turmeric px-3 py-1.5 font-display text-sm font-semibold text-[#7a5306]">
            <ReceiptIcon className="h-4 w-4" />
            Menunggu konfirmasi
          </span>
        </header>

        <div className="nota-rule mt-5 pt-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Dibuat</dt>
              <dd className="mt-0.5">{formatDateTime(order.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Pembayaran</dt>
              <dd className="mt-0.5">{label}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Nama</dt>
              <dd className="mt-0.5">{order.customer.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Telepon</dt>
              <dd className="price mt-0.5">{order.customer.phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted">Alamat kirim</dt>
              <dd className="mt-0.5 leading-relaxed">{order.customer.address}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 border-t border-dashed border-line">
          <p className="py-2 text-xs font-semibold text-muted">Barang dipesan</p>
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li
                key={item.productId}
                className="flex items-start justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="price mt-0.5 text-xs text-muted">
                    {item.qty} x {formatRupiah(item.unitPrice)}
                  </p>
                </div>
                <p className="price shrink-0 text-sm font-medium">
                  {formatRupiah(item.lineTotal)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 border-t border-dashed border-line pt-4">
          <dl className="space-y-1.5 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-muted">Jumlah barang</dt>
              <dd className="price">{totalQty} barang</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 text-base">
              <dt className="font-semibold">Total tagihan</dt>
              <dd className="price text-xl font-semibold">
                {formatRupiah(order.total)}
              </dd>
            </div>
          </dl>
        </div>

        <footer className="nota-rule mt-5 flex flex-wrap items-start justify-between gap-4 pt-4">
          <div className="max-w-xs">
            <p className="text-xs leading-relaxed text-muted">
              Bukti ini mencatat pesanan, bukan konfirmasi pembayaran. Toko
              memeriksa pembayaran {label.toLowerCase()} secara manual dan
              menghubungi nomor di atas.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Pindai kode QR untuk membuka rincian pesanan kapan saja.
            </p>
          </div>
          <OrderQr code={order.code} />
        </footer>
      </article>

      <div className="mt-5 flex flex-wrap gap-2 print:hidden">
        <Button onClick={() => window.print()}>
          <ReceiptIcon className="h-4 w-4" />
          Cetak bukti
        </Button>
        <Button asChild variant="outline">
          <Link to={`/pesanan/${order.code}`}>Buka rincian pesanan</Link>
        </Button>
      </div>
    </main>
  )
}
