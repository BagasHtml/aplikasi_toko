import { Link, useNavigate } from 'react-router-dom'
import { ReceiptIcon, TrashIcon } from '@/components/icons'
import { ProductArt } from '@/components/product-art'
import { QtyStepper } from '@/components/qty-stepper'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatRupiah } from '@/lib/format'
import { useCart } from '@/store/use-cart'

export function CartDrawer() {
  const {
    lines,
    count,
    subtotal,
    isOpen,
    closeCart,
    setQty,
    remove,
  } = useCart()
  const navigate = useNavigate()

  function go(path: string) {
    closeCart()
    navigate(path)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent aria-describedby="cart-drawer-desc">
        <SheetHeader>
          <SheetTitle>Keranjang</SheetTitle>
          <SheetDescription id="cart-drawer-desc">
            {count > 0
              ? `${count} barang siap diperiksa sebelum checkout.`
              : 'Belum ada barang di keranjang.'}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-tag border border-line bg-surface text-muted">
              <ReceiptIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">
                Keranjang masih kosong
              </p>
              <p className="mt-1 text-sm text-muted">
                Barang yang kamu tambahkan akan muncul di sini.
              </p>
            </div>
            <Button onClick={() => go('/katalog')} variant="outline">
              Lihat katalog
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <ul className="divide-y divide-line">
                {lines.map((line) => (
                  <li key={line.product.id} className="flex gap-3 py-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-tag border border-line bg-[#eee7d6]">
                      <ProductArt
                        art={line.product.art}
                        className="h-full w-full p-2 text-ink"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/produk/${line.product.id}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-semibold transition-colors hover:text-green"
                        >
                          {line.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(line.product.id)}
                          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-tag text-muted transition-colors hover:bg-[#f9ece8] hover:text-clay"
                          aria-label={`Hapus ${line.product.name} dari keranjang`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="price mt-0.5 text-sm text-muted">
                        {formatRupiah(line.product.price)}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <QtyStepper
                          compact
                          value={line.qty}
                          max={Math.max(line.product.stock, 1)}
                          onChange={(value) => setQty(line.product.id, value)}
                          label={line.product.name}
                          disabled={line.product.stock <= 0}
                        />
                        <p className="price text-sm font-semibold">
                          {formatRupiah(line.product.price * line.qty)}
                        </p>
                      </div>

                      {line.product.stock <= 0 ? (
                        <p className="mt-1.5 text-[11px] font-semibold text-clay">
                          Stok habis. Hapus barang ini untuk melanjutkan.
                        </p>
                      ) : line.qty >= line.product.stock ? (
                        <p className="mt-1.5 text-[11px] text-muted">
                          Sudah di jumlah maksimum, sisa {line.product.stock}{' '}
                          {line.product.unit}.
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line bg-surface px-5 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="price text-lg font-semibold">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Stok dicek ulang saat checkout. Pesanan ditolak kalau stok sudah
                habis.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => go('/keranjang')}>
                  Lihat keranjang
                </Button>
                <Button variant="accent" onClick={() => go('/checkout')}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
