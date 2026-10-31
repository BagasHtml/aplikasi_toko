import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertIcon, ReceiptIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ORDER_CODE = /^TL-\d{8}-[0-9A-F]{6}$/

export function OrderLookupPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = code.trim().toUpperCase()

    if (!normalized) {
      setError('Masukkan kode nota dulu.')
      return
    }
    if (!ORDER_CODE.test(normalized)) {
      setError('Kode nota berbentuk TL-20261031-ABCDEF.')
      return
    }

    navigate(`/pesanan/${normalized}`)
  }

  return (
    <main
      id="konten"
      tabIndex={-1}
      className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-16"
    >
      <p className="text-xs font-semibold text-muted">Cek pesanan</p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
        Buka rincian pesanan.
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
        Tempel kode nota yang kamu salin saat checkout. Kode ini muncul di layar
        setelah pesanan dibuat dan tercetak di bukti pembelian.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="nota-panel mt-8 p-5 sm:p-6 lg:p-8"
      >
        <Label htmlFor="kode-nota">Kode nota</Label>
        <Input
          id="kode-nota"
          className="price mt-1.5"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase())
            if (error) setError(null)
          }}
          placeholder="TL-20261031-ABCDEF"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'error-kode' : 'bantuan-kode'}
        />
        {error ? (
          <p
            id="error-kode"
            role="alert"
            className="mt-1.5 flex gap-1.5 text-xs font-medium text-clay"
          >
            <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : (
          <p
            id="bantuan-kode"
            className="mt-1.5 text-xs leading-relaxed text-muted"
          >
            Kode diawali TL-, lalu tanggal pesanan, lalu enam huruf atau angka.
          </p>
        )}

        <Button type="submit" size="lg" className="mt-4 w-full sm:w-auto">
          <ReceiptIcon className="h-4 w-4" />
          Lihat rincian pesanan
        </Button>
      </form>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Kalau kode tidak terbaca, buka lagi tautan pesanan dari layar checkout
        atau bukti pembelian.
      </p>
    </main>
  )
}
