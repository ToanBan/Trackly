import { useCallback, useEffect, useMemo, useState } from "react"
import { Eye } from "lucide-react"
import { getOrdersPage, type OrderResponse, type OrderStatus } from "@/api/orders"
import { SectionTitle, Modal, Pagination, formatPrice } from "./sharedUI"

const LIMIT = 10

type Filter = "Tất cả" | OrderStatus
const filters: Filter[] = ["Tất cả", "Pending", "Preparing", "Served", "Cancelled"]
const label: Record<Filter, string> = {
  "Tất cả": "Tất cả",
  Pending: "🟡 Chờ duyệt",
  Preparing: "🔵 Đang chế biến",
  Served: "🟢 Đã phục vụ",
  Cancelled: "🔴 Đã huỷ",
}
const statusClass: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Preparing: "bg-cyan-100 text-cyan-700",
  Served: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
}
function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass[status]}`}>{label[status]}</span>
}
function UserCell({ userId }: { userId: number | null }) {
  return userId == null ? (
    <span className="text-slate-400">—</span>
  ) : (
    <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-black tabular-nums text-cyan-700">#{userId}</span>
  )
}

export default function Orders() {
  const [items, setItems] = useState<OrderResponse[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<Filter>("Tất cả")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needLogin, setNeedLogin] = useState(false)
  const [detail, setDetail] = useState<OrderResponse | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await getOrdersPage(page, LIMIT)
      setItems(res.items ?? [])
      setTotal(res.total ?? 0)
      setNeedLogin(false)
      if (!silent) setError(null)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 401) setNeedLogin(true)
      else if (!silent) setError("Không thể tải danh sách đơn hàng.")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(
    () => (filter === "Tất cả" ? items : items.filter((o) => o.status === filter)),
    [items, filter],
  )

  return (
    <div className="space-y-6">
      <SectionTitle title="Đơn hàng" subtitle="Danh sách đơn theo bàn & người dùng · phân trang" />
      {needLogin && <p className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-bold text-rose-600">Cần đăng nhập để xem.</p>}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3">
          <p className="text-sm font-bold text-rose-600">{error}</p>
          <button onClick={() => void load()} className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-black text-white hover:bg-rose-700">Thử lại</button>
        </div>
      )}

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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-slate-400">Không có đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Mã đơn</th>
                  <th className="px-5 py-3">Bàn</th>
                  <th className="px-5 py-3">Người dùng</th>
                  <th className="px-5 py-3">Hoá đơn</th>
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
                    <td className="px-5 py-3 text-slate-600">Bàn {o.tableId}</td>
                    <td className="px-5 py-3"><UserCell userId={o.userId} /></td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">{o.billId != null ? `#${o.billId}` : "—"}</td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">{o.items.reduce((s, it) => s + it.quantity, 0)} món</td>
                    <td className="px-5 py-3 font-bold tabular-nums text-slate-800">{formatPrice(o.subtotal)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status as OrderStatus} /></td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setDetail(o)} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"><Eye size={13} /> Chi tiết</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100">
          <Pagination page={page} total={total} limit={LIMIT} onPage={setPage} />
        </div>
      </section>
{detail && (
        <Modal title={`Chi tiết đơn #${detail.id}`} onClose={() => setDetail(null)}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <div><p className="text-slate-500">Bàn</p><p className="font-bold text-slate-800">Bàn {detail.tableId}</p></div>
              <div><p className="text-slate-500">Hoá đơn</p><p className="font-bold tabular-nums text-slate-800">{detail.billId != null ? `#${detail.billId}` : "—"}</p></div>
              <div><p className="text-slate-500">Trạng thái</p><StatusBadge status={detail.status as OrderStatus} /></div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Món</th>
                    <th className="px-3 py-2 text-right">SL</th>
                    <th className="px-3 py-2 text-right">Đơn giá</th>
                    <th className="px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.items.map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2 font-semibold text-slate-700">{it.dishName}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">×{it.quantity}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">{formatPrice(it.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-bold tabular-nums text-slate-800">{formatPrice(it.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-slate-50">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 font-bold text-slate-600">Tổng đơn</td>
                    <td className="px-3 py-2 text-right font-black tabular-nums text-violet-600">{formatPrice(detail.subtotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setDetail(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Đóng</button>
            <button onClick={() => setDetail(null)} className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90">
              In hoá đơn
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}