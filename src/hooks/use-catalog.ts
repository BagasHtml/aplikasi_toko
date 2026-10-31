import { useCallback, useEffect, useState } from 'react'
import { ApiError, listProducts } from '@/lib/api'
import type { Product } from '@/lib/types'

export function useCatalog(query: { q: string; category: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const { q, category } = query

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const timer = window.setTimeout(() => {
      listProducts({ q, category })
        .then((data) => {
          if (cancelled) return
          setProducts(data.products)
          setCategories(data.categories)
          setTotal(data.total)
          setLoading(false)
        })
        .catch((err: unknown) => {
          if (cancelled) return
          setError(
            err instanceof ApiError
              ? err.message
              : 'Katalog gagal dimuat karena kesalahan tak terduga.',
          )
          setLoading(false)
        })
    }, 220)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [q, category, reloadKey])

  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  return { products, categories, total, loading, error, retry }
}
