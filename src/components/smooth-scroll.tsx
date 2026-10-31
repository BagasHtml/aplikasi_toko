import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      autoRaf: true,
      duration: 0.9,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    })

    return () => lenis.destroy()
  }, [])
}
