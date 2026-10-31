import { Link } from 'react-router-dom'
import { ProductArt } from '@/components/product-art'
import { StockBadge } from '@/components/stock-badge'
import { Button } from '@/components/ui/button'
import { formatRupiah } from '@/lib/format'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-green/45">
      <Link
        to={`/produk/${product.id}`}
        className="relative block aspect-5/4 overflow-hidden border-b border-line bg-[#eee7d6]"
        aria-label={`Lihat ${product.name}`}
      >
        <ProductArt
          art={product.art}
          className="h-full w-full p-6 text-ink transition-colors group-hover:text-green"
        />
        <span className="absolute top-3 left-3 rounded-tag border border-line bg-surface/90 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
          ilustrasi
        </span>
        <div className="absolute top-3 right-3">
          <StockBadge stock={product.stock} unit={product.unit} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold text-muted">{product.category}</p>
        <h3 className="font-display text-lg leading-snug font-semibold">
          <Link
            to={`/produk/${product.id}`}
            className="inline-flex min-h-11 items-center transition-colors hover:text-green"
          >
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted">
          {product.summary}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <p className="text-[11px] text-muted">Harga</p>
            <p className="price text-base font-semibold">
              {formatRupiah(product.price)}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={`/produk/${product.id}`}>Lihat barang</Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
