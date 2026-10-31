import { useCallback, useEffect, useState } from 'react'
import { ApiError, getProduct } from '@/lib/api'
import type { Product } from '@/lib/types'

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(
    null,
  )
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setProduct(null)

    getProduct(id)
      .then((data) => {
        if (cancelled) return
        setProduct(data.product)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError({
          message:
            err instanceof ApiError
              ? err.message
              : 'Barang gagal dimuat karena kesalahan tak terduga.',
          notFound: err instanceof ApiError && err.status === 404,
        })
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, reloadKey])

  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  return { product, loading, error, retry }
}
