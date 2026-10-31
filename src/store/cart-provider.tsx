import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartLine, Product } from '@/lib/types'
import {
  CartContext,
  type CartConflict,
  type CartMutationResult,
} from './cart-context'

const STORAGE_KEY = 'toko-listrik-cart-v1'

function readStoredLines(): CartLine[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item): CartLine[] => {
      if (!item || typeof item !== 'object') return []
      const candidate = item as { product?: Product; qty?: unknown }
      const product = candidate.product
      const qty = candidate.qty
      if (
        !product ||
        typeof product.id !== 'string' ||
        typeof product.name !== 'string' ||
        typeof product.price !== 'number' ||
        typeof product.stock !== 'number' ||
        typeof qty !== 'number' ||
        !Number.isInteger(qty) ||
        qty < 1
      ) {
        return []
      }
      return [{ product, qty }]
    })
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStoredLines)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      // penyimpanan penuh atau diblokir, keranjang tetap jalan di memori
    }
  }, [lines])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const add = useCallback(
    (product: Product, qty: number): CartMutationResult => {
      if (product.stock <= 0) {
        return {
          ok: false,
          message: `Stok ${product.name} sedang habis. Barang ini tidak bisa ditambahkan.`,
        }
      }
      if (!Number.isInteger(qty) || qty < 1) {
        return { ok: false, message: 'Jumlah harus bilangan bulat minimal 1.' }
      }

      const existing = lines.find((line) => line.product.id === product.id)
      const requested = (existing?.qty ?? 0) + qty
      const allowed = Math.min(requested, product.stock)
      const clamped = requested > product.stock

      setLines((current) => {
        if (existing) {
          return current.map((line) =>
            line.product.id === product.id ? { product, qty: allowed } : line,
          )
        }
        return [...current, { product, qty: allowed }]
      })

      return {
        ok: true,
        message: clamped
          ? `Jumlah disesuaikan ke sisa stok, ${product.stock} ${product.unit}.`
          : `${qty} ${product.unit} ${product.name} masuk keranjang.`,
      }
    },
    [lines],
  )

  const setQty = useCallback(
    (productId: string, qty: number): CartMutationResult => {
      if (!Number.isInteger(qty) || qty < 1) {
        return { ok: false, message: 'Jumlah harus bilangan bulat minimal 1.' }
      }
      const line = lines.find((item) => item.product.id === productId)
      if (!line) {
        return { ok: false, message: 'Barang tidak ada di keranjang.' }
      }
      if (line.product.stock <= 0) {
        return {
          ok: false,
          message: `Stok ${line.product.name} sedang habis. Hapus barang ini dari keranjang.`,
        }
      }
      if (qty > line.product.stock) {
        setLines((current) =>
          current.map((item) =>
            item.product.id === productId
              ? { ...item, qty: line.product.stock }
              : item,
          ),
        )
        return {
          ok: false,
          message: `Stok ${line.product.name} tersisa ${line.product.stock} ${line.product.unit}. Jumlah disesuaikan.`,
        }
      }
      setLines((current) =>
        current.map((item) =>
          item.product.id === productId ? { ...item, qty } : item,
        ),
      )
      return { ok: true, message: '' }
    },
    [lines],
  )

  const remove = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.product.id !== productId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const reconcile = useCallback(
    (products: Product[]): CartConflict[] => {
      const byId = new Map(products.map((product) => [product.id, product]))
      const conflicts: CartConflict[] = []
      const next = lines.map((line) => {
        const fresh = byId.get(line.product.id)
        if (!fresh) {
          conflicts.push({
            productId: line.product.id,
            name: line.product.name,
            requested: line.qty,
            available: 0,
            unit: line.product.unit,
          })
          return line
        }
        if (line.qty > fresh.stock) {
          conflicts.push({
            productId: fresh.id,
            name: fresh.name,
            requested: line.qty,
            available: fresh.stock,
            unit: fresh.unit,
          })
        }
        return { ...line, product: fresh }
      })
      setLines(next)
      return conflicts
    },
    [lines],
  )

  const clampToStock = useCallback(() => {
    let adjusted = 0
    let removed = 0
    const next: CartLine[] = []
    for (const line of lines) {
      if (line.product.stock <= 0) {
        removed += 1
        continue
      }
      if (line.qty > line.product.stock) {
        adjusted += 1
        next.push({ ...line, qty: line.product.stock })
        continue
      }
      next.push(line)
    }
    setLines(next)
    return { adjusted, removed }
  }, [lines])

  const value = useMemo(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0)
    const subtotal = lines.reduce(
      (sum, line) => sum + line.qty * line.product.price,
      0,
    )
    return {
      lines,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      add,
      setQty,
      remove,
      clear,
      reconcile,
      clampToStock,
    }
  }, [lines, isOpen, openCart, closeCart, add, setQty, remove, clear, reconcile, clampToStock])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
