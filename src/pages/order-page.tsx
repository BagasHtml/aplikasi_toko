import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeftIcon, CheckIcon, ReceiptIcon } from '@/components/icons'
import { CopyCodeButton } from '@/components/copy-code-button'
import { QrisPanel, TransferPanel } from '@/components/payment-panel'
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

function OrderSkeleton() {
  return (
    <main
      id="konten"
      tabIndex={-1}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      aria-busy="true"
    >
      <p className="sr-only">Memuat rincian pesanan...</p>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-10 w-80 max-w-full" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8 xl:gap-10">
        <div className="space-y-4">
          <Skeleton className="h-80 w-full rounded-panel" />
          <Skeleton className="h-64 w-full rounded-panel" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-panel" />
          <Skeleton className="h-44 w-full rounded-panel" />
        </div>
      </div>
    </main>
  )
}

export function OrderPage() {
  const { code: rawCode = '' } = useParams()
  const code = rawCode.trim().toUpperCase()
  const location = useLocation()
  const passedOrder = (location.state as { order?: Order } | null)?.order
  const [order, setOrder] = useState<Order | null>(
    passedOrder?.code === code ? passedOrder : null,
  )
  const [loading, setLoading] = useState(!order)
  const [error, setError] = useState<LoadError | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    getOrder(code)
      .then((data) => {
        if (cancelled) return
        setOrder(data.order)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setError({
          notFound: cause instanceof ApiError && cause.status === 404,
          message:
            cause instanceof ApiError
              ? cause.message
              : 'Rincian pesanan gagal dimuat karena kesalahan tak terduga.',
        })
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [code, reloadKey])

  if (!order) {
    if (loading) return <OrderSkeleton />

    return (
      <main
        id="konten"
        tabIndex={-1}
        className="mx-auto flex min-h-[60dvh] max-w-7xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <p className="text-sm font-semibold text-clay">
          {error?.notFound ? 'Pesanan tidak ditemukan' : 'Pesanan gagal dimuat'}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
          {error?.notFound
            ? 'Kode pesanan ini tidak tercatat.'
            : 'Rincian pesanan belum bisa dibuka.'}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {error?.message ??
            'Tidak ada data pesanan yang bisa ditampilkan. Periksa kembali tautan pesanan.'}
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
            <Link to="/katalog">
              <ArrowLeftIcon className="h-4 w-4" />
              Kembali ke katalog
            </Link>
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
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
    >
      <Link
        to="/katalog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-green"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke katalog
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-muted">Rincian pesanan</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Pesanan sudah tercatat.
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Stok sudah disesuaikan untuk pesanan ini. Salin kode{' '}
            <strong className="text-ink">{order.code}</strong> sebelum menutup
            halaman, supaya rincian bisa dibuka lagi lewat menu Cek pesanan.
          </p>
        </div>
        <span className="inline-flex -rotate-2 items-center gap-2 rounded-tag border-2 border-green px-3 py-1.5 font-display text-sm font-semibold text-green lg:px-4 lg:py-2 lg:text-base">
          <CheckIcon className="h-4 w-4" />
          Tercatat
        </span>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-start lg:gap-8 xl:gap-10">
        <div className="space-y-4">
          <section
            aria-labelledby="judul-rincian"
            className="nota-panel overflow-hidden"
          >
            <div className="border-b border-line px-5 py-4 sm:px-6 lg:px-8 lg:py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    id="judul-rincian"
                    className="font-display text-xl font-semibold lg:text-2xl"
                  >
                    Rincian pesanan
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-0.5">
                    <p className="price text-xs text-muted">{order.code}</p>
                    <CopyCodeButton code={order.code} />
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Dibuat {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>

            <ul className="divide-y divide-line px-5 sm:px-6 lg:px-8">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-start justify-between gap-4 py-3 lg:py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm leading-snug font-medium">
                      {item.name}
                    </p>
                    <p className="price mt-0.5 text-xs text-muted">
                      {item.qty} x {formatRupiah(item.unitPrice)}
                    </p>
                  </div>
                  <p className="price shrink-0 text-sm font-semibold">
                    {formatRupiah(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="border-t border-dashed border-line px-5 py-4 sm:px-6 lg:px-8 lg:py-5">
              <dl className="space-y-2 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Jumlah barang</dt>
                  <dd className="price">{totalQty} barang</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted">Pembayaran</dt>
                  <dd>{label}</dd>
                </div>
                <div className="nota-rule flex items-baseline justify-between gap-3 pt-3">
                  <dt className="font-semibold">Total</dt>
                  <dd className="price text-xl font-semibold">
                    {formatRupiah(order.total)}
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section
            aria-labelledby="judul-pembayaran"
            className="nota-panel p-5 sm:p-6 lg:p-7"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="judul-pembayaran"
                className="font-display text-lg font-semibold lg:text-xl"
              >
                Pembayaran
              </h2>
              <p className="price text-sm font-semibold">{label}</p>
            </div>
            <div className="mt-3">
              {order.payment === 'transfer' ? (
                <TransferPanel />
              ) : (
                <QrisPanel total={order.total} code={order.code} />
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section
            aria-labelledby="judul-status"
            className="nota-panel p-5 lg:p-6"
          >
            <h2
              id="judul-status"
              className="font-display text-lg font-semibold"
            >
              Status pesanan
            </h2>
            <ol className="mt-3 space-y-3">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-tag bg-green text-paper">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Pesanan dibuat</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="price mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-tag border border-turmeric bg-[#f8eccd] text-xs font-bold text-[#7a5306]">
                  2
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Konfirmasi pembayaran
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    Toko memeriksa pembayaran {label.toLowerCase()} secara
                    manual.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="price mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-tag border border-line bg-paper text-xs font-bold text-muted">
                  3
                </span>
                <div>
                  <p className="text-sm font-semibold">Barang disiapkan</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    Kami hubungi {order.customer.phone} setelah pembayaran
                    cocok.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section
            aria-labelledby="judul-pengiriman"
            className="nota-panel p-5 lg:p-6"
          >
            <h2
              id="judul-pengiriman"
              className="font-display text-lg font-semibold"
            >
              Dikirim ke
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Nama</dt>
                <dd className="mt-0.5">{order.customer.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Telepon</dt>
                <dd className="price mt-0.5">{order.customer.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Alamat</dt>
                <dd className="mt-0.5 leading-relaxed">
                  {order.customer.address}
                </dd>
              </div>
            </dl>
          </section>

          <Button asChild size="lg" className="w-full">
            <Link to={`/pesanan/${order.code}/bukti`}>
              <ReceiptIcon className="h-4 w-4" />
              Lihat bukti pembelian
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/katalog">Belanja lagi</Link>
          </Button>
        </aside>
      </div>
    </main>
  )
}
