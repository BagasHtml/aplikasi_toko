import { createContext } from 'react'
import type { CartLine, Product } from '@/lib/types'

export type CartConflict = {
  productId: string
  name: string
  requested: number
  available: number
  unit: string
}

export type CartMutationResult = {
  ok: boolean
  message: string
}

export type CartContextValue = {
  lines: CartLine[]
  count: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  add: (product: Product, qty: number) => CartMutationResult
  setQty: (productId: string, qty: number) => CartMutationResult
  remove: (productId: string) => void
  clear: () => void
  reconcile: (products: Product[]) => CartConflict[]
  clampToStock: () => { adjusted: number; removed: number }
}

export const CartContext = createContext<CartContextValue | null>(null)
