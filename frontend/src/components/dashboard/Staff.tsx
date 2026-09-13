import { useCallback, useEffect, useState } from "react"
import { getUsers, type UserSummary } from "@/api/users"
import { SectionTitle } from "./sharedUI"

export default function Staff() {
  const [staff, setStaff] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needLogin, setNeedLogin] = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await getUsers("staff", 1, 100)
      setStaff((res.items as UserSummary[]) ?? [])
      setNeedLogin(false)
      if (!silent) setError(null)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 401) setNeedLogin(true)
      else if (!silent) setError("Không thể tải danh sách nhân viên.")
    } finally { if (!silent) setLoading(false) }
  }, [])

  useEffect(() => {
    void load()
    const poll = setInterval(() => void load(true), 30_000)
    return () => clearInterval(poll)
  }, [load])

  return (
    <div className="space-y-6">
      <SectionTitle title="Nhân viên" subtitle={`Đội ngũ nhân viên · ${staff.length} người`} />
      {needLogin && <p className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-bold text-rose-600">Cần đăng nhập để xem.</p>}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3">
          <p className="text-sm font-bold text-rose-600">{error}</p>
          <button onClick={() => void load()} className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-black text-white hover:bg-rose-700">Thử lại</button>
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-violet-100 bg-white/95 py-16 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
        </div>
      ) : staff.length === 0 ? (
        <p className="rounded-2xl border border-violet-100 bg-white/95 px-5 py-16 text-center text-sm text-slate-400">
          Chưa có nhân viên nào — vào mục Người dùng để cấp quyền.
        </p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staff.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-500 text-sm font-black text-white">
                {s.username.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">{s.username}</p>
                <p className="truncate text-xs text-slate-500">{s.email}</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Đang làm</span>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}