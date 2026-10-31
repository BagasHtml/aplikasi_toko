import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/product-card'
import { useSmoothScroll } from '@/components/smooth-scroll'
import { StockBadge } from '@/components/stock-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCatalog } from '@/hooks/use-catalog'
import { formatRupiah } from '@/lib/format'

export function LandingPage() {
  useSmoothScroll()
  const { products, total, loading, error, retry } = useCatalog({
    q: '',
    category: 'Semua',
  })

  const initialLoading = loading && products.length === 0
  const lowStock = [...products]
    .filter((product) => product.stock > 0)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 3)
  const featured = products
    .filter((product) => product.stock > 0)
    .slice(0, 3)

  return (
    <main id="konten" tabIndex={-1}>
      <section
        aria-labelledby="judul-beranda"
        className="mx-auto max-w-7xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-20 lg:pb-16"
      >
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-center lg:gap-12 xl:gap-16">
          <div>
            <h1
              id="judul-beranda"
              className="max-w-3xl font-display text-4xl leading-[1.02] font-semibold sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Belanja tenang,
              <br />
              nota jelas.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted lg:text-lg">
              Harga dan sisa stok dibaca langsung dari database toko. Kalau stok
              habis saat checkout, pesanan ditolak. Barang tidak dikirim
              setengah.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/katalog">Cari barang</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/keranjang">Buka keranjang</Link>
              </Button>
            </div>
          </div>

          <aside className="nota-panel p-5 sm:p-6 lg:p-7">
            <div className="flex items-baseline justify-between gap-3 pb-3">
              <h2 className="font-display text-xl font-semibold">
                Sisa paling sedikit
              </h2>
              <span className="text-[11px] text-muted">tiga terendah</span>
            </div>

            <div className="nota-rule pt-3">
              {error ? (
                <div>
                  <p className="text-sm leading-relaxed text-muted">
                    Stok belum bisa dimuat. Katalog tetap bisa dibuka.
                  </p>
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="outline"
                    onClick={retry}
                  >
                    Coba lagi
                  </Button>
                </div>
              ) : initialLoading ? (
                <div className="space-y-3" aria-busy="true">
                  <span className="sr-only">Memuat stok...</span>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : lowStock.length === 0 ? (
                <p className="text-sm leading-relaxed text-muted">
                  Belum ada barang dengan sisa stok.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {lowStock.map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/produk/${product.id}`}
                        className="group flex items-start justify-between gap-3 py-3"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm leading-snug font-semibold transition-colors group-hover:text-green">
                            {product.name}
                          </span>
                          <span className="price mt-0.5 block text-xs text-muted">
                            {formatRupiah(product.price)}
                          </span>
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
            </div>

            <div className="nota-rule mt-3 flex items-center justify-between gap-3 pt-3">
              <span className="text-xs text-muted">
                {initialLoading
                  ? 'Menghitung barang...'
                  : `${total} barang di katalog`}
              </span>
              <Link
                to="/katalog"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-green transition-colors hover:text-ink"
              >
                Buka katalog
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section
        aria-labelledby="judul-nota"
        className="border-y border-line bg-surface/70"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
            <div>
              <h2
                id="judul-nota"
                className="font-display text-3xl font-semibold lg:text-4xl"
              >
                Yang tersimpan di nota.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted lg:text-base">
                Setelah pesanan dibuat, rincian ini tetap bisa dibuka lewat kode
                nota. Kamu tidak perlu mencatat ulang barang, harga, atau alamat
                kirim.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/pesanan">Buka rincian pesanan</Link>
              </Button>
            </div>

            <div className="nota-panel p-5 sm:p-6 lg:p-7">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-lg font-semibold">
                  Rincian pesanan
                </p>
                <span className="text-[11px] text-muted">isi nota</span>
              </div>

              <dl className="mt-3 divide-y divide-dashed divide-line border-t border-dashed border-line">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <dt className="text-sm text-muted">Barang dan jumlah</dt>
                  <dd className="text-sm font-semibold">
                    nama, jumlah, harga satuan
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <dt className="text-sm text-muted">Subtotal</dt>
                  <dd className="text-sm font-semibold">
                    harga dikali jumlah
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <dt className="text-sm text-muted">Pembayaran</dt>
                  <dd className="text-sm font-semibold">transfer atau QRIS</dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <dt className="text-sm text-muted">Alamat kirim</dt>
                  <dd className="text-sm font-semibold">
                    nama penerima dan alamat
                  </dd>
                </div>
              </dl>

              <p className="nota-rule mt-3 pt-3 text-xs leading-relaxed text-muted">
                Stok dikurangi saat pesanan dibuat dan diperiksa ulang di server.
                Kode nota dipakai untuk membuka rincian ini lagi.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="judul-pilihan"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="judul-pilihan"
              className="font-display text-3xl font-semibold lg:text-4xl"
            >
              Barang yang tersedia
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted lg:text-base">
              Tiga barang pertama dari katalog yang stoknya masih ada. Harga dan
              sisa stok mengikuti database.
            </p>
          </div>
          <Link
            to="/katalog"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-green transition-colors hover:text-ink"
          >
            Lihat semua barang
          </Link>
        </div>

        <div className="mt-6">
          {error ? (
            <div className="rounded-card border border-clay/30 bg-[#fdf3f1] p-6">
              <p className="font-semibold text-clay">
                Barang yang tersedia belum bisa dimuat
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink">{error}</p>
              <Button
                className="mt-4"
                size="sm"
                variant="outline"
                onClick={retry}
              >
                Coba lagi
              </Button>
            </div>
          ) : initialLoading ? (
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:gap-6"
              aria-busy="true"
            >
              <span className="sr-only">Memuat barang pilihan...</span>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-card border border-line bg-surface"
                >
                  <Skeleton className="aspect-5/4 rounded-none" />
                  <div className="space-y-2 p-4 lg:p-5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="mt-3 h-5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="rounded-card border border-line bg-surface p-8 text-center">
              <p className="font-display text-xl font-semibold">
                Belum ada barang tersedia
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Stok sedang kosong. Coba periksa katalog lagi nanti.
              </p>
              <Button asChild className="mt-5" variant="outline">
                <Link to="/katalog">Buka katalog</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-green text-paper">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-12">
          <div>
            <h2 className="font-display text-2xl font-semibold lg:text-3xl">
              Sudah tahu yang mau dibeli?
            </h2>
            <p className="mt-1.5 text-sm text-paper/85 lg:text-base">
              Buka katalog, cek sisa stok, lalu buat pesanan.
            </p>
          </div>
          <Button asChild size="lg" variant="accent">
            <Link to="/katalog">Buka katalog</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
