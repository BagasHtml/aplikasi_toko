import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CartIcon, MenuIcon } from '@/components/icons'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useCart } from '@/store/use-cart'

function mobileLink({ isActive }: { isActive: boolean }) {
  return cn(
    'flex min-h-12 items-center justify-between gap-3 rounded-tag px-3 text-base font-semibold transition-colors',
    isActive
      ? 'bg-green-soft text-green'
      : 'text-ink hover:bg-surface active:bg-surface',
  )
}

export function Header() {
  const { count, openCart } = useCart()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const cartActive =
    location.pathname === '/keranjang' || location.pathname === '/checkout'

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <Link
          to="/"
          aria-label="BelanjaKu, kembali ke beranda"
          className="inline-flex min-h-11 items-center"
        >
          <span className="font-display text-2xl leading-none font-semibold tracking-tight">
            BelanjaKu
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 sm:flex"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                'inline-flex min-h-11 items-center rounded-tag px-3 text-sm font-semibold transition-colors hover:bg-green-soft',
                isActive ? 'bg-green-soft text-green' : 'text-ink',
              )
            }
          >
            Beranda
          </NavLink>

          <NavLink
            to="/katalog"
            className={({ isActive }) =>
              cn(
                'inline-flex min-h-11 items-center rounded-tag px-3 text-sm font-semibold transition-colors hover:bg-green-soft',
                isActive ? 'bg-green-soft text-green' : 'text-ink',
              )
            }
          >
            Katalog
          </NavLink>

          <NavLink
            to="/pesanan"
            className={({ isActive }) =>
              cn(
                'inline-flex min-h-11 items-center rounded-tag px-3 text-sm font-semibold transition-colors hover:bg-green-soft',
                isActive ? 'bg-green-soft text-green' : 'text-ink',
              )
            }
          >
            Cek pesanan
          </NavLink>

          <button
            type="button"
            onClick={openCart}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-tag px-3 text-sm font-semibold transition-colors hover:bg-green-soft',
              cartActive ? 'text-green' : 'text-ink',
            )}
            aria-label={`Buka keranjang, ${count} barang`}
          >
            <CartIcon className="h-5 w-5" />
            <span>Keranjang</span>
            <span
              className={cn(
                'price inline-flex h-5 min-w-5 items-center justify-center rounded-tag px-1 text-[11px] font-bold',
                count > 0 ? 'bg-turmeric text-ink' : 'bg-line/70 text-ink',
              )}
              aria-hidden="true"
            >
              {count}
            </span>
          </button>
        </nav>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-tag text-ink transition-colors hover:bg-green-soft sm:hidden"
              aria-label="Buka menu navigasi"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            closeLabel="Tutup menu"
            aria-describedby="menu-desc"
            className="max-w-xs"
          >
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription id="menu-desc">
                {count > 0
                  ? `${count} barang di keranjang.`
                  : 'Keranjang masih kosong.'}
              </SheetDescription>
            </SheetHeader>

            <nav aria-label="Navigasi mobile" className="flex flex-col gap-1 p-3">
              <NavLink
                to="/"
                end
                onClick={() => setMenuOpen(false)}
                className={mobileLink}
              >
                Beranda
              </NavLink>

              <NavLink
                to="/katalog"
                onClick={() => setMenuOpen(false)}
                className={mobileLink}
              >
                Katalog
              </NavLink>

              <NavLink
                to="/pesanan"
                onClick={() => setMenuOpen(false)}
                className={mobileLink}
              >
                Cek pesanan
              </NavLink>

              <NavLink
                to="/keranjang"
                onClick={() => setMenuOpen(false)}
                className={mobileLink}
              >
                <span>Keranjang</span>
                <span
                  className={cn(
                    'price inline-flex h-6 min-w-6 items-center justify-center rounded-tag px-1.5 text-xs font-bold',
                    count > 0 ? 'bg-turmeric text-ink' : 'bg-line/70 text-ink',
                  )}
                  aria-hidden="true"
                >
                  {count}
                </span>
              </NavLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
