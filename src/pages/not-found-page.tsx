import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main
      id="konten" tabIndex={-1}
      className="mx-auto flex min-h-[60dvh] max-w-7xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
    >
      <p className="text-sm font-semibold text-clay">Halaman tidak ditemukan</p>
      <h1 className="mt-2 font-display text-4xl font-semibold lg:text-5xl">
        Alamat ini tidak ada di toko.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Mungkin tautannya salah ketik atau halaman sudah dipindahkan. Kembali ke
        katalog untuk melihat barang yang tersedia.
      </p>
      <Button asChild className="mt-6" variant="outline">
        <Link to="/katalog">
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali ke katalog
        </Link>
      </Button>
    </main>
  )
}
