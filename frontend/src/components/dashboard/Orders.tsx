import { useState } from "react"
import { Eye } from "lucide-react"
import type { Order } from "./types"
import { initialOrders } from "./mock"
import { SectionTitle, Modal, formatPrice, StatusBadge } from "./sharedUI"
export default function Orders() {
  const [filter, setFilter] = useState<"Tất cả" | Order["status"]>("Tất cả")
  const [detail, setDetail] = useState<Order | null>(null)
  const filters: ("Tất cả" | Order["status"])[] = ["Tất cả", "Open", "Checkout", "Paid"]
  const filtered = filter === "Tất cả" ? initialOrders : initialOrders.filter((o) => o.status === filter)
  const label: Record<string, string> = { Open: "🟡 Đang mở", Checkout: "🔵 Chờ thanh toán", Paid: "🟢 Đã trả", "Tất cả": "Tất cả" }

  return (
    <div className="space-y-6">
      <SectionTitle title="Đơn hàng" subtitle="Danh sách đơn · lọc theo trạng thái" />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-violet-200"
                : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-violet-50"
            }
          >
            {label[f]}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white/95 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Mã đơn</th>
              <th className="px-5 py-3">Bàn</th>
              <th className="px-5 py-3">Số món</th>
              <th className="px-5 py-3">Tổng tiền</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((o) => (
              <tr key={o.id} className="transition hover:bg-violet-50/40">
                <td className="px-5 py-3 font-bold text-slate-800">#{o.id}</td>
                <td className="px-5 py-3 text-slate-600">Bàn {o.table}</td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{o.items} món</td>
                <td className="px-5 py-3 font-bold tabular-nums text-slate-800">{formatPrice(o.total)}</td>
                <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setDetail(o)} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"><Eye size={13} /> Chi tiết</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">Không có đơn hàng nào ở trạng thái này.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {detail && (
        <Modal title={`Chi tiết đơn #${detail.id}`} onClose={() => setDetail(null)}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Bàn</span><span className="font-bold text-slate-800">Bàn {detail.table}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Số món</span><span className="font-bold text-slate-800">{detail.items} món</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Trạng thái</span><StatusBadge status={detail.status} /></div>
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-700">Tổng tiền</span>
              <span className="text-lg font-black tabular-nums text-violet-600">{formatPrice(detail.total)}</span>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setDetail(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Đóng</button>
            <button
              onClick={() => {
                setDetail(null)
              }}
              className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90"
            >
              In hoá đơn
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
