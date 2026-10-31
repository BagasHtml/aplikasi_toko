export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
  summary: string
  caption: string
  specs: string[]
  art: string
}

export type ProductsResponse = {
  products: Product[]
  categories: string[]
  total: number
}

export type CartLine = {
  product: Product
  qty: number
}

export type PaymentMethod = 'transfer' | 'qris'

export type Customer = {
  name: string
  phone: string
  address: string
}

export type Order = {
  code: string
  customer: Customer
  payment: PaymentMethod
  total: number
  createdAt: string
  items: Array<{
    productId: string
    name: string
    qty: number
    unitPrice: number
    lineTotal: number
  }>
}

export type StockConflict = {
  productId: string
  name: string
  requested: number
  available: number
  reason: 'OUT_OF_STOCK' | 'NOT_FOUND'
}

export type CheckoutPayload = {
  customer: Customer
  payment: PaymentMethod
  idempotencyKey: string
  items: Array<{ productId: string; qty: number }>
}
