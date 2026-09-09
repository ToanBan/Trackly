import type { ReactNode } from "react"
import { LayoutDashboard, FolderTree, UtensilsCrossed, Armchair, ReceiptText, Users, Star } from "lucide-react"
import type { Section } from "./types"

export const navItems: { id: Section; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Tổng quan", icon: <LayoutDashboard size={17} /> },
  { id: "categories", label: "Danh mục món", icon: <FolderTree size={17} /> },
  { id: "dishes", label: "Món ăn", icon: <UtensilsCrossed size={17} /> },
  { id: "tables", label: "Bàn ăn", icon: <Armchair size={17} /> },
  { id: "orders", label: "Đơn hàng", icon: <ReceiptText size={17} /> },
  { id: "staff", label: "Nhân viên", icon: <Users size={17} /> },
  { id: "loyalty", label: "Khách hàng thân thiết", icon: <Star size={17} /> },
]
