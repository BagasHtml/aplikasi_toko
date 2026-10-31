import type {
  CheckoutPayload,
  Order,
  Product,
  ProductsResponse,
  StockConflict,
} from './types'

export class ApiError extends Error {
  status: number
  code: string
  fields?: Record<string, string>
  conflicts?: StockConflict[]

  constructor(
    status: number,
    code: string,
    message: string,
    options?: { fields?: Record<string, string>; conflicts?: StockConflict[] },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = options?.fields
    this.conflicts = options?.conflicts
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    })
  } catch {
    throw new ApiError(
      0,
      'NETWORK',
      'Server tidak bisa dihubungi. Pastikan API berjalan, lalu coba lagi.',
    )
  }

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const error = (body as { error?: Record<string, unknown> } | null)?.error
    throw new ApiError(
      response.status,
      typeof error?.code === 'string' ? error.code : 'REQUEST_FAILED',
      typeof error?.message === 'string'
        ? error.message
        : 'Permintaan gagal diproses. Coba lagi.',
      {
        fields: error?.fields as Record<string, string> | undefined,
        conflicts: error?.conflicts as StockConflict[] | undefined,
      },
    )
  }

  return body as T
}

export function listProducts(params: { q?: string; category?: string } = {}) {
  const search = new URLSearchParams()
  if (params.q) search.set('q', params.q)
  if (params.category && params.category !== 'Semua') search.set('category', params.category)
  const suffix = search.toString()
  return request<ProductsResponse>(`/api/products${suffix ? `?${suffix}` : ''}`)
}

export function getProduct(id: string) {
  return request<{ product: Product }>(`/api/products/${encodeURIComponent(id)}`)
}

export function checkout(payload: CheckoutPayload) {
  return request<{ order: Order; reused: boolean }>('/api/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getOrder(code: string) {
  return request<{ order: Order }>(`/api/orders/${encodeURIComponent(code)}`)
}
