import { useCallback, useEffect, useMemo, useState } from "react"
import { ReceiptText, CreditCard, CheckCircle2 } from "lucide-react"
import { getBills, payBill, type Bill } from "@/api/bills"
import { getUserPoints } from "@/api/loyalty"
import { SectionTitle, Modal, Pagination, formatPrice } from "./sharedUI"

const LIMIT = 10
const REDEEM_THRESHOLD = 400
const REDEEM_POINTS = 400
const DISCOUNT_PERCENT = 10
const POINTS_PER_ORDER = 100

type Filter = "Tất cả" | "Open" | "Paid"

const filters: Filter[] = ["Tất cả", "Open", "Paid"]
const label: Record<Filter, string> = {
  "Tất cả": "Tất cả",
  Open: "🟡 Đang mở",
  Paid: "🟢 Đã trả",
}

function BillStatusBadge({ status }: { status: Bill["status"] }) {
  const map: Record<string, string> = {
    Open: "bg-amber-100 text-amber-700",
    Paid: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-rose-100 text-rose-700",
  }
  const text: Record<string, string> = { Open: "Đang mở", Paid: "Đã trả", Cancelled: "Đã huỷ" }
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${map[status]}`}>{text[status]}</span>
  )
}

function UserCell({ userId }: { userId: number | null }) {
  return userId == null ? (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">Khách vãng lai</span>
  ) : (
    <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-black tabular-nums text-cyan-700">👤 #{userId}</span>
  )
}

export default function Bills() {
  const [items, setItems] = useState<Bill[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<Filter>("Tất cả")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needLogin, setNeedLogin] = useState(false)

  const [detail, setDetail] = useState<Bill | null>(null)

  // Payment modal
  const [payTarget, setPayTarget] = useState<Bill | null>(null)
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [pointsLoading, setPointsLoading] = useState(false)
  const [useLoyalty, setUseLoyalty] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payMessage, setPayMessage] = useState<string | null>(null)
  const [payError, setPayError] = useState<string | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await getBills(page, LIMIT)
      setItems(res.items ?? [])
      setTotal(res.total ?? 0)
      setNeedLogin(false)
      if (!silent) setError(null)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 401) setNeedLogin(true)
      else if (!silent) setError("Không thể tải danh sách hoá đơn.")
    } finally {
      if (!silent) setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  // Lấy điểm user khi mở modal thanh toán cho bill có userId.
  useEffect(() => {
    if (!payTarget || payTarget.userId == null) {
      setUserPoints(null)
      setUseLoyalty(false)
      return
    }
    let cancelled = false
    setPointsLoading(true)
    setUserPoints(null)
    setUseLoyalty(false)
    getUserPoints(payTarget.userId)
      .then((p) => {
        if (!cancelled) {
          setUserPoints(p)
          setUseLoyalty(p >= REDEEM_THRESHOLD)
        }
      })
      .catch(() => {
        if (!cancelled) setUserPoints(0)
      })
      .finally(() => {
        if (!cancelled) setPointsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [payTarget])

  const filtered = useMemo(
    () => (filter === "Tất cả" ? items : items.filter((b) => b.status === filter)),
    [items, filter],
  )

  const discount = payTarget && useLoyalty ? Math.round(payTarget.subtotal * DISCOUNT_PERCENT) / 100 : 0
  const newTotal = payTarget ? payTarget.total - discount : 0

  function openPay(bill: Bill) {
    setPayTarget(bill)
    setPayMessage(null)
    setPayError(null)
    setUseLoyalty(false)
  }

  async function confirmPay() {
    if (!payTarget || paying) return
    setPaying(true)
    setPayError(null)
    setPayMessage(null)
    try {
      const res = await payBill(payTarget.id, useLoyalty)
      setItems((prev) => prev.map((b) => (b.id === payTarget.id ? res.bill : b)))
      setPayMessage(res.message)
    } catch (err) {
      setPayError((err as { message?: string }).message ?? "Thanh toán thất bại.")
    } finally {
      setPaying(false)
    }
  }

  function closePay() {
    if (paying) return
    setPayTarget(null)
    setUserPoints(null)
    setUseLoyalty(false)
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Hoá đơn" subtitle="Danh sách hoá đơn theo bàn & người dùng · phân trang" />
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
          <p className="px-5 py-16 text-center text-sm text-slate-400">Chưa có hoá đơn nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Mã hoá đơn</th>
                  <th className="px-5 py-3">Bàn</th>
                  <th className="px-5 py-3">Người dùng</th>
                  <th className="px-5 py-3">Thành tiền</th>
                  <th className="px-5 py-3">Giảm giá</th>
                  <th className="px-5 py-3">Tổng</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="transition hover:bg-violet-50/40">
                    <td className="px-5 py-3 font-bold text-slate-800">#{b.id}</td>
                    <td className="px-5 py-3 text-slate-600">Bàn {b.tableId}</td>
                    <td className="px-5 py-3"><UserCell userId={b.userId} /></td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">{formatPrice(b.subtotal)}</td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">
                      {b.discountAmount > 0 ? (
                        <span className="font-bold text-emerald-600">−{formatPrice(b.discountAmount)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 font-black tabular-nums text-slate-800">{formatPrice(b.total)}</td>
                    <td className="px-5 py-3"><BillStatusBadge status={b.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => setDetail(b)} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700">
                          <ReceiptText size={13} /> Chi tiết
                        </button>
                        {b.status === "Open" && (
                          <button onClick={() => openPay(b)} className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-violet-200 transition hover:bg-violet-600">
                            <CreditCard size={13} /> Thanh toán
                          </button>
                        )}
                      </div>
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

      {/* ── Modal chi tiết hoá đơn ── */}
      {detail && (
        <Modal title={`Chi tiết hoá đơn #${detail.id}`} onClose={() => setDetail(null)}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-slate-500">Bàn</p><p className="font-bold text-slate-800">Bàn {detail.tableId}</p></div>
              <div><p className="text-slate-500">Người dùng</p><UserCell userId={detail.userId} /></div>
            </div>

            <div className="max-h-64 overflow-y-auto pr-1">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Đơn hàng ({detail.orders.length})</p>
              <div className="space-y-3">
                {detail.orders.length === 0 && <p className="text-slate-400">Không có đơn hàng.</p>}
                {detail.orders.map((o) => (
                  <div key={o.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <p className="text-xs font-black text-slate-700">Đơn #{o.id}</p>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">{o.status}</span>
                    </div>
                    <div className="space-y-1">
                      {o.items.map((it) => (
                        <div key={it.id} className="flex items-center justify-between text-xs">
                          <span className="truncate text-slate-700">{it.dishName} <span className="text-slate-400">× {it.quantity}</span></span>
                          <span className="font-bold tabular-nums text-slate-700">{formatPrice(it.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-1.5 flex justify-between border-t border-slate-200 pt-1.5 text-xs">
                      <span className="text-slate-500">Tổng đơn</span>
                      <span className="font-black tabular-nums text-slate-800">{formatPrice(o.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-3">
              <div className="flex justify-between"><span className="text-slate-500">Thành tiền</span><span className="font-bold tabular-nums text-slate-800">{formatPrice(detail.subtotal)}</span></div>
              {detail.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Giảm {DISCOUNT_PERCENT}% · {detail.loyaltyPointsUsed} điểm</span><span className="font-bold">−{formatPrice(detail.discountAmount)}</span></div>
              )}
              <div className="flex justify-between text-slate-500"><span>Điểm tích được</span><span className="font-bold text-cyan-600">+{detail.loyaltyPointsEarned} điểm</span></div>
              <div className="mt-1 flex justify-between border-t border-slate-200 pt-2"><span className="font-bold text-slate-700">Tổng thanh toán</span><span className="text-lg font-black tabular-nums text-violet-600">{formatPrice(detail.total)}</span></div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setDetail(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Đóng</button>
            {detail.status === "Open" && (
              <button onClick={() => { setDetail(null); openPay(detail) }} className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90">
                <CreditCard size={14} /> Thanh toán
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* ── Modal thanh toán ── */}
      {payTarget && (
        <Modal title={`Thanh toán hoá đơn #${payTarget.id}`} onClose={closePay}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-slate-500">Bàn</p><p className="font-bold text-slate-800">Bàn {payTarget.tableId}</p></div>
              <div><p className="text-slate-500">Người dùng</p><UserCell userId={payTarget.userId} /></div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-500">Thành tiền</span><span className="font-bold tabular-nums text-slate-800">{formatPrice(payTarget.subtotal)}</span></div>
              {useLoyalty && (
                <div className="flex justify-between text-emerald-600"><span>Giảm {DISCOUNT_PERCENT}% ({REDEEM_POINTS} điểm)</span><span className="font-bold">−{formatPrice(discount)}</span></div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2"><span className="font-bold text-slate-700">Tổng thanh toán</span><span className="text-lg font-black tabular-nums text-violet-600">{formatPrice(newTotal)}</span></div>
            </div>

            {payTarget.userId == null ? (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-slate-600">Hoá đơn không gắn tài khoản — thanh toán bình thường, không tích điểm.</p>
            ) : pointsLoading ? (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-slate-500">Đang kiểm tra điểm khách hàng…</p>
            ) : userPoints != null && userPoints >= REDEEM_THRESHOLD ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
                <input
                  type="checkbox"
                  checked={useLoyalty}
                  onChange={(e) => setUseLoyalty(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-violet-600"
                />
                <span>
                  <span className="block font-bold text-violet-800">Đổi 400 điểm giảm 10% hoá đơn?</span>
                  <span className="block text-xs text-violet-600">
                    Khách có <b className="tabular-nums">{userPoints.toLocaleString("vi-VN")}</b> điểm — còn lại <b className="tabular-nums">{(userPoints - REDEEM_POINTS).toLocaleString("vi-VN")}</b>, tích +{POINTS_PER_ORDER} điểm sau thanh toán.
                  </span>
                </span>
              </label>
            ) : (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-amber-700">
                Khách có <b>{userPoints?.toLocaleString("vi-VN") ?? 0}</b> điểm — chưa đủ {REDEEM_THRESHOLD} điểm để đổi ưu đãi giảm giá.
              </p>
            )}

            {payMessage && (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={16} /> {payMessage}
              </p>
            )}
            {payError && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{payError}</p>}
          </div>

          {!payMessage && (
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={closePay} disabled={paying} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                Huỷ
              </button>
              <button
                onClick={() => void confirmPay()}
                disabled={paying}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90 disabled:opacity-50"
              >
                <CreditCard size={14} /> {paying ? "Đang xử lý…" : "Xác nhận thanh toán"}
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}