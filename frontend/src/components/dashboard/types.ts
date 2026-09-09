export type Section =
  | "overview" | "categories" | "dishes" | "tables" | "orders" | "staff" | "loyalty"

export type Category = { id: number; name: string; emoji: string; dishes: number }
export type Dish = { id: number; name: string; category: string; image: string; price: number; available: boolean }
export type Table = { id: number; name: string; seats: number; occupied: boolean; qr: string; slug?: string }
export type Order = { id: number; table: string; items: number; total: number; status: "Open" | "Checkout" | "Paid" }
export type Staff = { id: number; name: string; role: string; phone: string; active: boolean }
export type Customer = { id: number; name: string; phone: string; points: number; tier: string }
