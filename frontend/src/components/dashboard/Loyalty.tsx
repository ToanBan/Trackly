import { useCallback, useEffect, useState } from "react"
import { Gift } from "lucide-react"
import { getUsers, type CustomerLoyalty } from "@/api/users"
import { SectionTitle, tierClass } from "./sharedUI"

function tierOf(points: number): string {
  if (points >= 1000) return "Kim cương"
  if (points >= 500) return "Vàng"
  if (points >= 200) return "Bạc"
  return "Thân thiết"
}

export default function Loyalty() {
  const [items, setItems] = useState<CustomerLoyalty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needLogin, setNeedLogin] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await getUsers("user", 1, 100)
      setItems((res.items as CustomerLoyalty[]) ?? [])
      setNeedLogin(false)
      if (!silent) setError(null)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 401) setNeedLogin(true)
      else if (!silent) setError("Không thể tải khách hàng thân thiết.")
    } finally { if (!silent) setLoading(false) }
  }, [])

  useEffect(() => {
    void load()
    const poll = setInterval(() => void load(true), 30_000)
    return () => clearInterval(poll)
  }, [load])

  return (
    <div className="space-y-6">
      <SectionTitle title="Khách hàng thân thiết" subtitle={`Tài khoản tích điểm & hạng thành viên · ${items.length} khách`} />
      {needLogin && <p className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-bold text-rose-600">Cần đăng nhập để xem.</p>}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3">
          <p className="text-sm font-bold text-rose-600">{error}</p>
          <button onClick={() => void load()} className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-black text-white hover:bg-rose-700">Thử lại</button>
        </div>
      )}
      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white/95 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
          </div>
        ) : items.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-slate-400">Chưa có khách hàng thân thiết nào.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-5 py-3">Email / SĐT</th>
                <th className="px-5 py-3">Điểm</th>
                <th className="px-5 py-3">Hạng</th>
                <th className="px-5 py-3 text-right">Ưu đãi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((c) => (
                <tr key={c.id} className="transition hover:bg-violet-50/40">
                  <td className="px-5 py-3 font-bold text-slate-800">{c.username}</td>
                  <td className="px-5 py-3 tabular-nums text-slate-600">{c.email || c.phoneNumber || "—"}</td>
                  <td className="px-5 py-3 font-black tabular-nums text-violet-600">{c.points.toLocaleString("vi-VN")}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tierClass(tierOf(c.points))}`}>{tierOf(c.points)}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"><Gift size={13} /> Đổi quà</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}