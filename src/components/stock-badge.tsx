import { Badge } from '@/components/ui/badge'

type StockBadgeProps = {
  stock: number
  unit: string
}

export function StockBadge({ stock, unit }: StockBadgeProps) {
  if (stock <= 0) {
    return <Badge variant="empty">Habis</Badge>
  }
  if (stock <= 5) {
    return <Badge variant="low">{`Sisa ${stock} ${unit}`}</Badge>
  }
  return <Badge variant="stock">{`Sisa ${stock} ${unit}`}</Badge>
}

export function stockLabel(stock: number, unit: string): string {
  if (stock <= 0) return 'Stok habis'
  return `Stok tersedia ${stock} ${unit}`
}
