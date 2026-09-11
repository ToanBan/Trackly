import type { Category, Dish, Table, Order, Staff, Customer } from "./types"

export const initialCategories: Category[] = [
  { id: 1, name: "Món chính", description: null, imageUrl: null, isActive: true, dishes: 8 },
  { id: 2, name: "Phở & Bún", description: null, imageUrl: null, isActive: true, dishes: 6 },
  { id: 3, name: "Món nướng", description: null, imageUrl: null, isActive: true, dishes: 9 },
  { id: 4, name: "Đồ uống", description: null, imageUrl: null, isActive: true, dishes: 12 },
  { id: 5, name: "Tráng miệng", description: null, imageUrl: null, isActive: true, dishes: 5 },
]

export const initialDishes: Dish[] = [
  { id: 1, name: "Phở bò đặc biệt", description: null, imageUrl: "https://placehold.co/80x80/e2e8f0/64748b?text=Phở", price: 55000, isAvailable: true, categoryId: 2, categoryName: "Phở & Bún" },
  { id: 2, name: "Bò nướng lá lốt", description: null, imageUrl: "https://placehold.co/80x80/e2e8f0/64748b?text=Bò", price: 89000, isAvailable: true, categoryId: 3, categoryName: "Món nướng" },
  { id: 3, name: "Cơm tấm sườn nướng", description: null, imageUrl: "https://placehold.co/80x80/e2e8f0/64748b?text=Cơm", price: 45000, isAvailable: false, categoryId: 1, categoryName: "Món chính" },
  { id: 4, name: "Sò điệp nướng", description: null, imageUrl: "https://placehold.co/80x80/e2e8f0/64748b?text=Sò", price: 75000, isAvailable: true, categoryId: 3, categoryName: "Món nướng" },
  { id: 5, name: "Cà phê sữa đá", description: null, imageUrl: "https://placehold.co/80x80/e2e8f0/64748b?text=CF", price: 25000, isAvailable: false, categoryId: 4, categoryName: "Đồ uống" },
]

export const initialTables: Table[] = []

export const initialOrders: Order[] = [
  { id: 1042, table: "12", items: 3, total: 145000, status: "Open" },
  { id: 1043, table: "05", items: 6, total: 289000, status: "Open" },
  { id: 1044, table: "03", items: 4, total: 198000, status: "Checkout" },
  { id: 1045, table: "08", items: 2, total: 96000, status: "Paid" },
  { id: 1046, table: "21", items: 5, total: 312000, status: "Checkout" },
  { id: 1047, table: "01", items: 3, total: 128000, status: "Paid" },
]

export const initialStaff: Staff[] = [
  { id: 1, name: "Trần Văn Bếp", role: "Đầu bếp", phone: "0901 234 567", active: true },
  { id: 2, name: "Lê Thị Phục", role: "Phục vụ", phone: "0902 345 678", active: true },
  { id: 3, name: "Phạm Văn Nướng", role: "Đầu bếp", phone: "0903 456 789", active: false },
  { id: 4, name: "Hoàng Thị Thu", role: "Thu ngân", phone: "0904 567 890", active: true },
]

export const initialCustomers: Customer[] = [
  { id: 1, name: "Nguyễn Văn A", phone: "0911 111 111", points: 2450, tier: "Vàng" },
  { id: 2, name: "Trần Thị B", phone: "0922 222 222", points: 1180, tier: "Bạc" },
  { id: 3, name: "Lê Văn C", phone: "0933 333 333", points: 5600, tier: "Kim cương" },
  { id: 4, name: "Phạm Thị D", phone: "0944 444 444", points: 320, tier: "Thành viên" },
]