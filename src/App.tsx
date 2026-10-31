import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { CartDrawer } from '@/components/cart-drawer'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Skeleton } from '@/components/ui/skeleton'
import { CartPage } from '@/pages/cart-page'
import { CatalogPage } from '@/pages/catalog-page'
import { LandingPage } from '@/pages/landing-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { OrderLookupPage } from '@/pages/order-lookup-page'
import { ProductPage } from '@/pages/product-page'
import { CartProvider } from '@/store/cart-provider'

const CheckoutPage = lazy(() =>
  import('@/pages/checkout-page').then((module) => ({
    default: module.CheckoutPage,
  })),
)

const OrderPage = lazy(() =>
  import('@/pages/order-page').then((module) => ({
    default: module.OrderPage,
  })),
)

const PurchaseProofPage = lazy(() =>
  import('@/pages/purchase-proof-page').then((module) => ({
    default: module.PurchaseProofPage,
  })),
)

function CheckoutFallback() {
  return (
    <main
      id="konten"
      tabIndex={-1}
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
      aria-busy="true"
    >
      <p className="text-xs font-semibold text-muted">Langkah 2 dari 2</p>
      <Skeleton className="mt-2 h-9 w-52" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 xl:gap-12">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </main>
  )
}

function OrderFallback() {
  return (
    <main
      id="konten"
      tabIndex={-1}
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
      aria-busy="true"
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-9 w-64" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8 xl:gap-10">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <CartProvider>
      <a href="#konten" className="skip-link print:hidden">
        Lewati ke konten
      </a>
      <ScrollToTop />
      <div className="flex min-h-dvh flex-col">
        <Header />
        <CartDrawer />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/katalog" element={<CatalogPage />} />
            <Route path="/produk/:id" element={<ProductPage />} />
            <Route path="/keranjang" element={<CartPage />} />
            <Route
              path="/checkout"
              element={
                <Suspense fallback={<CheckoutFallback />}>
                  <CheckoutPage />
                </Suspense>
              }
            />
            <Route path="/pesanan" element={<OrderLookupPage />} />
            <Route
              path="/pesanan/:code"
              element={
                <Suspense fallback={<OrderFallback />}>
                  <OrderPage />
                </Suspense>
              }
            />
            <Route
              path="/pesanan/:code/bukti"
              element={
                <Suspense fallback={<OrderFallback />}>
                  <PurchaseProofPage />
                </Suspense>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </CartProvider>
  )
}
