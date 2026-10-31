import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 lg:py-10">
        <div>
          <p className="font-display text-lg font-semibold">BelanjaKu</p>
        </div>
        <nav
          aria-label="Navigasi footer"
          className="flex flex-wrap items-center gap-x-4 gap-y-0 text-sm font-semibold"
        >
          <Link
            to="/"
            className="inline-flex min-h-11 items-center transition-colors hover:text-green"
          >
            Beranda
          </Link>
          <Link
            to="/katalog"
            className="inline-flex min-h-11 items-center transition-colors hover:text-green"
          >
            Katalog
          </Link>
          <Link
            to="/pesanan"
            className="inline-flex min-h-11 items-center transition-colors hover:text-green"
          >
            Cek pesanan
          </Link>
          <Link
            to="/keranjang"
            className="inline-flex min-h-11 items-center transition-colors hover:text-green"
          >
            Keranjang
          </Link>
        </nav>
      </div>
    </footer>
  )
}
