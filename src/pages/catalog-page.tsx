import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertIcon, CloseIcon, SearchIcon } from '@/components/icons'
import { ProductCard } from '@/components/product-card'
import { StockBadge } from '@/components/stock-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useCatalog } from '@/hooks/use-catalog'
import { cn } from '@/lib/utils'

function CatalogSkeleton() {
  return (
    <div aria-busy="true">
      <p className="sr-only">Memuat katalog...</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-card border border-line bg-surface"
          >
            <Skeleton className="aspect-5/4 rounded-none" />
            <div className="space-y-2 p-4 lg:p-5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <div className="flex items-end justify-between pt-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const { products, categories, total, loading, error, retry } = useCatalog({
    q: search,
    category,
  })

  const initialLoading = loading && products.length === 0
  const filtered = search.trim() !== '' || category !== 'Semua'
  const lowStock = [...products]
    .filter((product) => product.stock > 0)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 3)

  return (
    <main id="konten" tabIndex={-1}>
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 lg:px-8 lg:pt-10 lg:pb-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-start lg:gap-10 xl:gap-14">
          <div>
            <p className="text-sm font-semibold text-green">Katalog</p>
            <h1 className="mt-1 max-w-2xl font-display text-3xl leading-[1.06] font-semibold sm:text-4xl lg:text-5xl">
              Cari barang, cek sisa stoknya.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted lg:text-base">
              Harga dan stok berasal dari database toko. Filter kategori atau
              cari nama barang untuk mempersempit pilihan.
            </p>

            <div className="mt-5 max-w-xl">
              <label
                htmlFor="cari-barang"
                className="text-xs font-semibold text-muted"
              >
                Cari barang
              </label>
              <div className="relative mt-1.5">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="cari-barang"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ponsel, motor, rice cooker..."
                  className="h-12 pr-12 pl-10"
                  aria-describedby="cari-bantuan"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute top-1/2 right-1 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-tag text-muted transition-colors hover:bg-paper hover:text-ink"
                    aria-label="Hapus kata pencarian"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <p id="cari-bantuan" className="mt-2 text-xs text-muted">
                Pencarian memeriksa nama, ringkasan, dan kategori.
              </p>
            </div>
          </div>

          <aside className="nota-panel p-5 lg:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">
                Sisa paling sedikit
              </h2>
              <span className="text-[11px] text-muted">tiga terendah</span>
            </div>

            {error ? (
              <p className="mt-3 text-sm text-muted">
                Stok belum bisa dimuat karena katalog gagal diambil.
              </p>
            ) : initialLoading ? (
              <div className="mt-3 space-y-2.5" aria-busy="true">
                <span className="sr-only">Memuat stok...</span>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : lowStock.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Belum ada barang dengan sisa stok.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-line">
                {lowStock.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/produk/${product.id}`}
                      className="group flex items-center justify-between gap-3 py-2.5"
                    >
                      <span className="text-sm leading-snug transition-colors group-hover:text-green">
                        {product.name}
                      </span>
                      <StockBadge
                        stock={product.stock}
                        unit={product.unit}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <p className="nota-rule mt-3 pt-3 text-xs leading-relaxed text-muted">
              Angka di panel ini berasal dari database yang sama dengan halaman
              detail.
            </p>
          </aside>
        </div>
      </section>

      <section
        id="katalog"
        aria-labelledby="judul-katalog"
        className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
      >
        <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between lg:pt-8">
          <div>
            <h2
              id="judul-katalog"
              className="font-display text-2xl font-semibold"
            >
              Semua barang
            </h2>
            <p className="mt-1 text-sm text-muted" aria-live="polite">
              {loading
                ? 'Memuat barang...'
                : `${total} barang ditemukan${
                    category !== 'Semua' ? ` di ${category}` : ''
                  }.`}
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter kategori"
            className="flex flex-wrap gap-2"
          >
            {['Semua', ...categories].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={cn(
                  'h-11 rounded-tag border px-3.5 text-xs font-semibold transition-colors',
                  category === item
                    ? 'border-green bg-green text-paper'
                    : 'border-line bg-surface text-ink hover:border-green hover:text-green',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {error ? (
            <div className="rounded-card border border-clay/30 bg-[#fdf3f1] p-6">
              <div className="flex gap-3">
                <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-clay" />
                <div>
                  <p className="font-semibold text-clay">Katalog gagal dimuat</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink">
                    {error}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    Kalau kamu menjalankan mode pengembangan, pastikan API hidup.
                    Jalankan <code className="font-semibold">npm run dev</code>{' '}
                    supaya Vite dan API port 8787 berjalan bersama.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={retry}>
                    Coba lagi
                  </Button>
                </div>
              </div>
            </div>
          ) : initialLoading ? (
            <CatalogSkeleton />
          ) : products.length === 0 ? (
            <div className="rounded-card border border-line bg-surface p-8 text-center">
              <p className="font-display text-xl font-semibold">
                Tidak ada barang yang cocok
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                Coba kata kunci lain, atau tampilkan semua kategori untuk melihat
                seluruh katalog.
              </p>
              <Button
                className="mt-5"
                variant="outline"
                onClick={() => {
                  setSearch('')
                  setCategory('Semua')
                }}
              >
                Tampilkan semua barang
              </Button>
            </div>
          ) : (
            <>
              {loading ? (
                <p className="mb-3 text-xs font-semibold text-muted" role="status">
                  Memperbarui hasil...
                </p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {filtered ? (
                <p className="mt-6 text-xs text-muted">
                  Menampilkan hasil filter. Harga dan stok tetap dari database.
                </p>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
