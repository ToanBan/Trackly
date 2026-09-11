export type Section =
  | "overview" | "categories" | "dishes" | "tables" | "orders" | "staff" | "loyalty"

export type Category = {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  /** Nombre real de plats d'aquesta categoria (calculat a partir de la llista de plats). */
  dishes: number
}
export type Dish = {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  price: number
  isAvailable: boolean
  categoryId: number
  categoryName?: string
}
export type Table = { id: number; name: string; seats: number; occupied: boolean; qr: string; slug?: string }
export type Order = { id: number; table: string; items: number; total: number; status: "Open" | "Checkout" | "Paid" }
export type Staff = { id: number; name: string; role: string; phone: string; active: boolean }
export type Customer = { id: number; name: string; phone: string; points: number; tier: string }
