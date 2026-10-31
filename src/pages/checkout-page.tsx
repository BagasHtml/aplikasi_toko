import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { AlertIcon, ArrowLeftIcon } from '@/components/icons'
import { QrisPanel, TransferPanel } from '@/components/payment-panel'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, checkout, listProducts } from '@/lib/api'
import { formatRupiah } from '@/lib/format'
import { copyText } from '@/lib/clipboard'
import type { Order, PaymentMethod, StockConflict } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useCart } from '@/store/use-cart'
import { formatPhone, validatePhone } from '@shared/phone'

type FormState = {
  name: string
  phone: string
  address: string
}

function newIdempotencyKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `key-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p
      id={id}
      className="mt-1.5 flex gap-1.5 text-xs font-medium text-clay"
    >
      <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  )
}

function PaymentOption({
  value,
  label,
  description,
  checked,
}: {
  value: PaymentMethod
  label: string
  description: string
  checked: boolean
}) {
  const id = `bayar-${value}`
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-tag border p-3 transition-colors',
        checked
          ? 'border-green bg-green-soft/50'
          : 'border-line bg-surface hover:border-muted/60',
      )}
    >
      <RadioGroupItem value={value} id={id} className="mt-0.5" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
          {description}
        </span>
      </span>
    </label>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const {
    lines,
    subtotal,
    clear,
    reconcile,
  } = useCart()

  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    address: '',
  })
  const [payment, setPayment] = useState<PaymentMethod>('transfer')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [stockLoading, setStockLoading] = useState(true)
  const [stockError, setStockError] = useState<string | null>(null)
  const [conflicts, setConflicts] = useState<StockConflict[]>([])
  const [conflictOpen, setConflictOpen] = useState(false)

  const idempotencyRef = useRef(newIdempotencyKey())
  const cartSignature = lines
    .map((line) => `${line.product.id}:${line.qty}`)
    .join('|')

  useEffect(() => {
    idempotencyRef.current = newIdempotencyKey()
  }, [cartSignature])

  useEffect(() => {
    let cancelled = false
    if (lines.length === 0) {
      setStockLoading(false)
      return
    }

    listProducts()
      .then((data) => {
        if (cancelled) return
        reconcile(data.products)
        setStockLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setStockError(
          error instanceof ApiError
            ? error.message
            : 'Stok tidak bisa diperbarui karena kesalahan tak terduga.',
        )
        setStockLoading(false)
      })

    return () => {
      cancelled = true
    }
    // Pemeriksaan stok sengaja hanya saat halaman dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const liveConflicts = lines.filter(
    (line) => line.product.stock <= 0 || line.qty > line.product.stock,
  )

  function updateField(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function handlePhoneBlur() {
    const check = validatePhone(form.phone)
    if (!check.ok) {
      setFieldErrors((current) => ({ ...current, phone: check.message }))
      return
    }
    setFieldErrors((current) => {
      if (!current.phone) return current
      const next = { ...current }
      delete next.phone
      return next
    })
    setForm((current) => ({
      ...current,
      phone: formatPhone(check.value ?? current.phone),
    }))
  }

  async function refreshStock() {
    try {
      const data = await listProducts()
      reconcile(data.products)
    } catch {
      // Dialog konflik tetap memakai data dari server.
    }
  }

  async function showThankYou(order: Order) {
    await Swal.fire({
      icon: 'success',
      iconColor: '#1E4B38',
      title: 'Pesanan tercatat',
      html: `
        <p>Pesanan sudah dibuat dan stoknya sudah disesuaikan.</p>
        <div class="nota-line"><span>Total</span><span>${formatRupiah(order.total)}</span></div>
        <div class="nota-line"><span>Pembayaran</span><span>${order.payment === 'transfer' ? 'Transfer bank' : 'QRIS'}</span></div>
        <div class="nota-copy">
          <span class="nota-copy-label">Kode nota</span>
          <span class="nota-copy-code price">${order.code}</span>
          <button type="button" class="nota-copy-button" data-copy-code>Salin kode nota</button>
        </div>
        <p class="nota-copy-hint" data-copy-hint>Salin kode ini dulu. Kode dipakai untuk membuka rincian pesanan lewat menu Cek pesanan.</p>
      `,
      didOpen: () => {
        const button = document.querySelector<HTMLButtonElement>(
          '[data-copy-code]',
        )
        const hint = document.querySelector<HTMLElement>('[data-copy-hint]')
        if (!button) return
        button.addEventListener('click', async () => {
          const copied = await copyText(order.code)
          button.textContent = copied ? 'Kode tersalin' : 'Gagal menyalin'
          if (hint) {
            hint.textContent = copied
              ? 'Kode sudah disalin. Tempel di halaman Cek pesanan kalau rincian ini ditutup.'
              : `Kode belum tersalin. Salin manual: ${order.code}`
          }
        })
      },
      confirmButtonText: 'Lihat rincian pesanan',
      buttonsStyling: false,
      customClass: {
        popup: 'toko-swal',
        title: 'toko-swal-title',
        htmlContainer: 'toko-swal-html',
        actions: 'toko-swal-actions',
        confirmButton: 'toko-swal-confirm',
      },
      allowEscapeKey: true,
      focusConfirm: true,
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    setSubmitError(null)
    const nextErrors: Record<string, string> = {}
    const name = form.name.trim()
    const address = form.address.trim()
    const phoneCheck = validatePhone(form.phone)

    if (name.length < 2) {
      nextErrors.name = 'Nama penerima minimal 2 karakter.'
    } else if (name.length > 80) {
      nextErrors.name = 'Nama penerima maksimal 80 karakter.'
    }
    if (!phoneCheck.ok) nextErrors.phone = phoneCheck.message
    if (address.length < 10) {
      nextErrors.address =
        'Alamat minimal 10 karakter, sebutkan jalan dan nomor rumah.'
    } else if (address.length > 240) {
      nextErrors.address = 'Alamat maksimal 240 karakter.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setSubmitError('Ada isian yang perlu diperbaiki. Lihat pesan di bawah kolom.')
      const order = ['name', 'phone', 'address'] as const
      const ids = {
        name: 'nama-penerima',
        phone: 'nomor-telepon',
        address: 'alamat',
      }
      const first = order.find((key) => nextErrors[key])
      if (first) {
        window.requestAnimationFrame(() => {
          document.getElementById(ids[first])?.focus()
        })
      }
      return
    }

    if (liveConflicts.length > 0) {
      setConflicts(
        liveConflicts.map((line) => ({
          productId: line.product.id,
          name: line.product.name,
          requested: line.qty,
          available: line.product.stock,
          reason: 'OUT_OF_STOCK',
        })),
      )
      setConflictOpen(true)
      return
    }

    setSubmitting(true)
    try {
      const result = await checkout({
        customer: {
          name,
          phone: phoneCheck.value ?? '',
          address,
        },
        payment,
        idempotencyKey: idempotencyRef.current,
        items: lines.map((line) => ({
          productId: line.product.id,
          qty: line.qty,
        })),
      })

      clear()
      await showThankYou(result.order)
      navigate(`/pesanan/${result.order.code}`, {
        replace: true,
        state: { order: result.order },
      })
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'STOCK_CONFLICT') {
          setConflicts(error.conflicts ?? [])
          setConflictOpen(true)
          setSubmitError(error.message)
          void refreshStock()
        } else if (error.fields) {
          setFieldErrors(error.fields)
          setSubmitError(error.message)
        } else {
          setSubmitError(error.message)
        }
      } else {
        setSubmitError('Terjadi kesalahan tak terduga. Coba lagi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (lines.length === 0) {
    return (
      <main
        id="konten" tabIndex={-1}
        className="mx-auto flex min-h-[60dvh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:py-20"
      >
        <h1 className="font-display text-3xl font-semibold">
          Belum ada yang bisa dibayar
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Keranjangmu kosong. Tambahkan barang dulu, lalu kembali ke halaman ini
          untuk mengisi data penerima.
        </p>
        <Button asChild className="mt-6">
          <Link to="/katalog">Lihat katalog</Link>
        </Button>
      </main>
    )
  }

  const total = subtotal
  const submitDisabled =
    submitting || stockLoading || liveConflicts.length > 0

  return (
    <main id="konten" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Link
        to="/keranjang"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-green"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Kembali ke keranjang
      </Link>

      <div className="mt-4">
        <p className="text-xs font-semibold text-muted">Langkah 2 dari 2</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
          Checkout
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          Isi data penerima dan pilih cara bayar. Stok baru dikurangi setelah
          pesanan dibuat, dan hanya kalau stoknya masih ada.
        </p>
      </div>

      {stockError ? (
        <div
          role="alert"
          className="mt-5 flex gap-2 rounded-tag border border-turmeric/50 bg-[#f8eccd] px-4 py-3 text-sm text-[#7a5306]"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Stok tidak bisa diperbarui</p>
            <p className="mt-1 text-ink">{stockError}</p>
            <p className="mt-1 text-xs">
              Kamu masih bisa membuat pesanan. Server tetap menolak kalau stok
              sudah habis.
            </p>
          </div>
        </div>
      ) : null}

      {liveConflicts.length > 0 ? (
        <div
          role="alert"
          className="mt-5 rounded-card border border-turmeric/50 bg-[#f8eccd] p-4"
        >
          <div className="flex gap-3">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#7a5306]" />
            <div>
              <p className="font-semibold text-[#7a5306]">
                Jumlah di keranjang melebihi stok
              </p>
              <p className="mt-1 text-sm text-ink">
                Perbaiki jumlah dulu supaya pesanan bisa dibuat. Stok tidak
                dikurangi selama ini.
              </p>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-3"
              >
                <Link to="/keranjang">Periksa keranjang</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-10 xl:gap-12"
      >
        <div className="space-y-8 lg:space-y-10">
          <section aria-labelledby="judul-penerima">
            <h2
              id="judul-penerima"
              className="font-display text-xl font-semibold lg:text-2xl"
            >
              Data penerima
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="nama-penerima">Nama penerima</Label>
                <Input
                  id="nama-penerima"
                  className="mt-1.5"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  autoComplete="name"
                  placeholder="Nama lengkap"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? 'error-nama' : undefined
                  }
                />
                <FieldError id="error-nama" message={fieldErrors.name} />
              </div>

              <div>
                <Label htmlFor="nomor-telepon">Nomor telepon</Label>
                <Input
                  id="nomor-telepon"
                  className="mt-1.5"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) => updateField('phone', event.target.value)}
                  onBlur={handlePhoneBlur}
                  autoComplete="tel"
                  placeholder="0812-3456-7890"
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={
                    fieldErrors.phone
                      ? 'error-telepon'
                      : 'bantuan-telepon'
                  }
                />
                <FieldError id="error-telepon" message={fieldErrors.phone} />
                {!fieldErrors.phone ? (
                  <p
                    id="bantuan-telepon"
                    className="mt-1.5 text-xs leading-relaxed text-muted"
                  >
                    Nomor Indonesia yang aktif, contoh 0812-3456-7890 atau +62
                    812-3456-7890.
                  </p>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="alamat">Alamat lengkap</Label>
                <Textarea
                  id="alamat"
                  className="mt-1.5"
                  rows={3}
                  value={form.address}
                  onChange={(event) =>
                    updateField('address', event.target.value)
                  }
                  autoComplete="street-address"
                  placeholder="Jalan, nomor rumah, kelurahan, kota"
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={
                    fieldErrors.address ? 'error-alamat' : 'bantuan-alamat'
                  }
                />
                <FieldError id="error-alamat" message={fieldErrors.address} />
                {!fieldErrors.address ? (
                  <p
                    id="bantuan-alamat"
                    className="mt-1.5 text-xs leading-relaxed text-muted"
                  >
                    Minimal 10 karakter. Sebutkan jalan dan nomor rumah supaya
                    alamat tidak ambigu.
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section aria-labelledby="judul-pembayaran">
            <h2
              id="judul-pembayaran"
              className="font-display text-xl font-semibold lg:text-2xl"
            >
              Pembayaran
            </h2>
            <p className="mt-1 text-sm text-muted">
              Pilih satu metode pembayaran.
            </p>
            <RadioGroup
              value={payment}
              onValueChange={(value) => setPayment(value as PaymentMethod)}
              className="mt-4 grid gap-2.5 sm:grid-cols-2"
              aria-label="Metode pembayaran"
            >
              <PaymentOption
                value="transfer"
                label="Transfer bank"
                description="Instruksi rekening ditampilkan di bawah."
                checked={payment === 'transfer'}
              />
              <PaymentOption
                value="qris"
                label="QRIS"
                description="Kode QR untuk total pesanan ditampilkan di bawah."
                checked={payment === 'qris'}
              />
            </RadioGroup>
            {fieldErrors.payment ? (
              <FieldError id="error-pembayaran" message={fieldErrors.payment} />
            ) : null}

            <div className="mt-4">
              {payment === 'transfer' ? (
                <TransferPanel />
              ) : (
                <QrisPanel total={total} />
              )}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="nota-panel p-5 lg:p-6">
            <h2 className="font-display text-lg font-semibold lg:text-xl">
              Ringkasan pesanan
            </h2>

            <ul className="mt-3 divide-y divide-line">
              {lines.map((line) => (
                <li
                  key={line.product.id}
                  className="flex items-baseline justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block leading-snug">
                      {line.product.name}
                    </span>
                    <span className="price mt-0.5 block text-xs text-muted">
                      {line.qty} {line.product.unit} x{' '}
                      {formatRupiah(line.product.price)}
                    </span>
                  </span>
                  <span className="price shrink-0 font-semibold">
                    {formatRupiah(line.product.price * line.qty)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="nota-rule mt-3 flex items-baseline justify-between gap-3 pt-3">
              <span className="font-semibold">Total</span>
              <span className="price text-xl font-semibold lg:text-2xl">
                {formatRupiah(total)}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">
              Tidak ada biaya tambahan.
            </p>

            {stockLoading ? (
              <p
                className="mt-3 text-xs font-semibold text-muted"
                role="status"
              >
                Memeriksa stok terbaru...
              </p>
            ) : null}

            {submitError ? (
              <div
                role="alert"
                className="mt-4 flex gap-2 rounded-tag border border-clay/30 bg-[#fdf3f1] px-3 py-2.5 text-sm text-clay"
              >
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{submitError}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="mt-4 w-full"
              disabled={submitDisabled}
            >
              {submitting ? 'Membuat pesanan...' : 'Buat pesanan'}
            </Button>

            <p className="mt-2 text-xs leading-relaxed text-muted">
              Dengan menekan tombol ini, pesanan dibuat dan stok langsung
              dikurangi.
            </p>
          </div>
        </aside>
      </form>

      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stok berubah saat checkout</DialogTitle>
            <DialogDescription>
              Tidak ada stok yang dikurangi. Periksa jumlah berikut, lalu
              sesuaikan keranjang sebelum mencoba lagi.
            </DialogDescription>
          </DialogHeader>

          <ul className="divide-y divide-line overflow-hidden rounded-tag border border-line">
            {conflicts.map((conflict) => (
              <li
                key={conflict.productId}
                className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm"
              >
                <span className="min-w-0">{conflict.name}</span>
                <span className="price shrink-0 text-right text-xs text-muted">
                  Diminta {conflict.requested}
                  <br />
                  Tersedia{' '}
                  <strong className="text-clay">
                    {conflict.available}
                  </strong>
                </span>
              </li>
            ))}
          </ul>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConflictOpen(false)}
            >
              Tutup
            </Button>
            <Button
              type="button"
              onClick={() => {
                setConflictOpen(false)
                navigate('/keranjang')
              }}
            >
              Periksa keranjang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
