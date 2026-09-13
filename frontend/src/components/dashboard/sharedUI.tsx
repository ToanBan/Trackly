import type { ReactNode } from "react"
import { X } from "lucide-react"
import type { Order } from "./types"
export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ"
}

export function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    Open: "bg-amber-100 text-amber-700",
    Checkout: "bg-cyan-100 text-cyan-700",
    Paid: "bg-emerald-100 text-emerald-700",
  }
  const label: Record<Order["status"], string> = {
    Open: "Đang mở", Checkout: "Thanh toán", Paid: "Đã trả",
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${map[status]}`}>{label[status]}</span>
  )
}

export function tierClass(tier: string): string {
  if (tier === "Kim cương") return "bg-cyan-100 text-cyan-700"
  if (tier === "Vàng") return "bg-amber-100 text-amber-700"
  if (tier === "Bạc") return "bg-slate-200 text-slate-700"
  return "bg-violet-100 text-violet-700"
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
      <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

export function ActionButton({ label, icon, onClick }: { label: string; icon?: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:opacity-90"
    >
      {icon}
      {label}
    </button>
  )
}

/* ── Modal dùng chung cho Thêm / Sửa ──────────────────────── */
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Modal xác nhận (xoá mặc định, có thể tuỳ nhãn & kiểu) ─────── */
export function ConfirmDialog({ title, message, onCancel, onConfirm, confirmLabel = "Xoá", danger = true }: {
  title: string; message: string; onCancel: () => void; onConfirm: () => void
  confirmLabel?: string; danger?: boolean
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Huỷ</button>
        <button
          onClick={onConfirm}
          className={
            danger
              ? "rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-red-200 transition hover:bg-red-600"
              : "rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90"
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

/* ── Field input dùng chung trong modal ───────────────────── */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"

/* ── Phân trang dùng chung ─────────────────────────────────── */
export function Pagination({ page, total, limit, onPage }: {
  page: number
  total: number
  limit: number
  onPage: (p: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / limit))
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
      <span className="text-slate-500">
        Trang <b className="text-slate-800">{page}</b> / {pages}
        <span className="ml-2 text-slate-400">· {total} bản ghi</span>
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-bold text-slate-600 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ‹ Trước
        </button>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-bold text-slate-600 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau ›
        </button>
      </div>
    </div>
  )
}
