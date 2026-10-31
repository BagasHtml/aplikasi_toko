import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertIcon, ArrowLeftIcon } from '@/components/icons'
import { ProductArt } from '@/components/product-art'
import { QtyStepper } from '@/components/qty-stepper'
import { StockBadge, stockLabel } from '@/components/stock-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProduct } from '@/hooks/use-product'
import { formatRupiah } from '@/lib/format'
import { useCart } from '@/store/use-cart'

type Notice = {
  tone: 'ok' | 'error'
  text: string
}

function DetailSkeleton() {
  return (
    <div
      className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:gap-14"
      aria-busy="true"
    >
      <p className="sr-only">Memuat detail barang...</p>
      <div>
        <Skeleton className="aspect-4/3 w-full rounded-panel" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}

export function ProductPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { add, openCart } = useCart()
  const { product, loading, error, retry } = useProduct(id)
  const [qty, setQty] = useState(1)
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    setQty(1)
    setNotice(null)
  }, [product?.id])

  function handleAdd() {
    if (!product) return
    const result = add(product, qty)
    setNotice({ tone: result.ok ? 'ok' : 'error', text: result.message })
    if (result.ok) openCart()
  }

  function handleBuyNow() {
    if (!product) return
    const result = add(product, qty)
    if (!result.ok) {
      setNotice({ tone: 'error', text: result.message })
      return
    }
    navigate('/checkout')
  }

  if (loading) {
    return (
      <main id="konten" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <DetailSkeleton />
      </main>
    )
  }

  if (error || !product) {
    return (
      <main
        id="konten" tabIndex={-1}
        className="mx-auto flex min-h-[60dvh] max-w-7xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <p className="text-sm font-semibold text-clay">
          {error?.notFound ? 'Barang tidak ditemukan' : 'Detail gagal dimuat'}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold lg:text-4xl">
          {error?.notFound
            ? 'Barang ini tidak ada di katalog.'
            : 'Kami belum bisa menampilkan barang ini.'}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {error?.message ||
            'Barang tidak tersedia. Kembali ke katalog untuk melihat pilihan lain.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {!error?.notFound ? (
            <Button variant="outline" onClick={retry}>
              Coba lagi
            </Button>
          ) : null}
          <Button asChild variant={error?.notFound ? 'default' : 'outline'}>
            <Link to="/katalog">
              <ArrowLeftIcon className="h-4 w-4" />
              Kembali ke katalog
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  const soldOut = product.stock <= 0

  return (
    <main id="konten" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav
        aria-label="Remah roti"
        className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted"
      >
        <Link to="/katalog" className="transition-colors hover:text-green">
          Katalog
        </Link>
        <span aria-hidden="true">/</span>
        <span>{product.category}</span>
        <span aria-hidden="true">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:gap-14">
        <div>
          <div className="relative overflow-hidden rounded-panel border border-line bg-[#eee7d6]">
            <ProductArt
              art={product.art}
              className="aspect-4/3 w-full p-8 text-ink sm:p-12 lg:p-14"
            />
            <span className="absolute top-4 left-4 rounded-tag border border-line bg-surface/90 px-2 py-1 text-[10px] font-semibold text-muted">
              ilustrasi
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <p>Gambar adalah ilustrasi garis, bukan foto produk.</p>
            <p className="price">Kode: {product.id}</p>
          </div>

          <section className="mt-8" aria-labelledby="tentang-barang">
            <h2
              id="tentang-barang"
              className="font-display text-xl font-semibold lg:text-2xl"
            >
              Tentang barang
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {product.caption}
            </p>

            <h3 className="mt-6 text-sm font-semibold">Spesifikasi</h3>
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {product.specs.map((spec) => (
                <li key={spec} className="py-2.5 text-sm">
                  {spec}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="nota-panel p-5 sm:p-6 lg:p-7">
            <p className="text-xs font-semibold text-muted">
              {product.category}
            </p>
            <h1 className="mt-1 font-display text-3xl leading-tight font-semibold lg:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {product.summary}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="price font-display text-3xl font-semibold lg:text-4xl">
                {formatRupiah(product.price)}
              </p>
              <StockBadge stock={product.stock} unit={product.unit} />
            </div>

            <div className="nota-rule mt-4 pt-4">
              <p className="text-xs text-muted">
                {stockLabel(product.stock, product.unit)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <QtyStepper
                  value={qty}
                  max={Math.max(product.stock, 1)}
                  onChange={setQty}
                  label={product.name}
                  disabled={soldOut}
                  describedBy="qty-batas"
                />
                <p id="qty-batas" className="text-xs text-muted">
                  Maksimal {product.stock} {product.unit} per pesanan.
                </p>
              </div>
            </div>

            {notice ? (
              <p
                role="status"
                className={
                  notice.tone === 'ok'
                    ? 'mt-4 rounded-tag border border-green/25 bg-green-soft px-3 py-2 text-sm text-green'
                    : 'mt-4 flex gap-2 rounded-tag border border-clay/30 bg-[#fdf3f1] px-3 py-2 text-sm text-clay'
                }
              >
                {notice.tone === 'error' ? (
                  <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                ) : null}
                {notice.text}
              </p>
            ) : null}

            {soldOut ? (
              <p className="mt-4 flex gap-2 rounded-tag border border-clay/30 bg-[#fdf3f1] px-3 py-2 text-sm text-clay">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                Stok habis. Barang ini tidak bisa ditambahkan ke keranjang.
              </p>
            ) : null}

            <div className="mt-5 grid gap-2">
              <Button
                type="button"
                size="lg"
                onClick={handleAdd}
                disabled={soldOut}
              >
                Tambah ke keranjang
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={soldOut}
              >
                Beli sekarang
              </Button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted">
              Stok diperbarui saat checkout. Kalau stok habis di tengah jalan,
              pesanan ditolak dan tidak ada stok yang dikurangi.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
