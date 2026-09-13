import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { getMyLoyalty, type LoyaltyResponse } from "@/api/loyalty"
import {
  User as UserIcon, Mail, Lock, LogOut, Pencil, Check, X, Eye, EyeOff,
  ChefHat, UtensilsCrossed, Flame, Star, ShieldAlert, Camera, Sparkles,
  TrendingUp, CalendarDays, CheckCircle2,
} from "lucide-react"

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  /* ── Thông tin cá nhân (form chỉnh sửa) ── */
  const [username, setUsername] = useState(user?.username ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  /* ── Đổi mật khẩu ── */
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  /* ── Điểm tích luỹ (Loyalty) ── */
  const [loyalty, setLoyalty] = useState<LoyaltyResponse | null>(null)
  const [loyaltyLoading, setLoyaltyLoading] = useState(true)
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null)

  const loadLoyalty = () => {
    setLoyaltyLoading(true)
    setLoyaltyError(null)
    getMyLoyalty()
      .then(setLoyalty)
      .catch(() => setLoyaltyError("Không thể tải điểm tích luỹ. Vui lòng thử lại."))
      .finally(() => setLoyaltyLoading(false))
  }

  useEffect(() => {
    loadLoyalty()
  }, [])

  // Tiến độ tới 400 điểm (ngưỡng đổi giảm 10% hóa đơn), clamp 0–100%
  const redeemTarget = 400
  const progress =
    loyalty == null ? 0 : Math.min(100, Math.round((loyalty.points / redeemTarget) * 100))

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)]">
        <div className="rounded-3xl border border-violet-100 bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(167,139,250,0.15)]">
          <UserIcon size={56} className="mx-auto text-violet-400" />
          <h1 className="mt-4 text-3xl font-black text-slate-900">Bạn chưa đăng nhập</h1>
          <p className="mt-2 text-slate-500">Đăng nhập để xem và quản lý hồ sơ của bạn.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:opacity-90"
          >
            Đi đến đăng nhập
          </button>
        </div>
      </div>
    )
  }

  const initials = user.username
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const saveProfile = (e: FormEvent) => {
    e.preventDefault()
    // TODO: gọi API cập nhật hồ sơ khi sẵn sàng
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const changePassword = (e: FormEvent) => {
    e.preventDefault()
    setPwMsg(null)
    if (!pw.current || !pw.next || !pw.confirm) {
      setPwMsg({ ok: false, text: "Vui lòng điền đầy đủ cả 3 trường." })
      return
    }
    if (pw.next.length < 6) {
      setPwMsg({ ok: false, text: "Mật khẩu mới cần ít nhất 6 ký tự." })
      return
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ ok: false, text: "Mật khẩu nhập lại không khớp." })
      return
    }
    // TODO: gọi API đổi mật khẩu khi sẵn sàng
    setPw({ current: "", next: "", confirm: "" })
    setPwMsg({ ok: true, text: "Đổi mật khẩu thành công!" })
  }
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] text-slate-800">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">

        {/* ── Header trang ── */}
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-200">
              <UtensilsCrossed size={20} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">Trackly</span>
          </Link>
          <button
            onClick={async () => { await logout(); navigate("/login") }}
            className="flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </header>

        {/* ── Hero card ── */}
        <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-500 to-cyan-500 p-8 shadow-[0_25px_60px_rgba(139,92,246,0.35)]">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

          <div className="relative flex flex-wrap items-center gap-6">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 text-4xl font-black text-white shadow-inner backdrop-blur">
                {initials}
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-violet-600 shadow-lg transition hover:scale-110">
                <Camera size={16} />
              </button>
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5">
                <h1 className="truncate text-3xl font-black text-white">{user.username}</h1>
                <span className="flex items-center gap-1 rounded-full bg-amber-300/90 px-3 py-1 text-xs font-black text-amber-900">
                  <Star size={12} /> THÀNH VIÊN VÀNG
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 text-white/80">
                <Mail size={15} /> {user.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur">
                  <CheckCircle2 size={13} /> Tài khoản hoạt động
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur">
                  <CalendarDays size={13} /> Tham gia từ 2025
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-white backdrop-blur">
                  <Sparkles size={13} /> ID #{user.id}
                </span>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-violet-600 shadow-lg transition hover:scale-[1.03] hover:bg-violet-50"
            >
              <Pencil size={16} /> Chỉnh sửa hồ sơ
            </button>
          </div>
        </section>
        {/* ── Thống kê nhanh ── */}
        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { Icon: ChefHat, label: "Món đã theo dõi", value: "128", cls: "from-violet-500 to-fuchsia-500 shadow-violet-200" },
            { Icon: Flame, label: "Chuỗi ngày liên tục", value: "14", cls: "from-orange-400 to-rose-500 shadow-rose-200" },
            { Icon: TrendingUp, label: "Điểm tích luỹ", value: loyaltyLoading ? "..." : (loyalty?.points.toLocaleString("vi-VN") ?? "0"), cls: "from-cyan-400 to-blue-500 shadow-cyan-200" },
          ].map(({ Icon, label, value, cls }) => (
            <div key={label} className="flex items-center gap-4 rounded-3xl border border-white bg-white/85 p-5 shadow-[0_12px_30px_rgba(167,139,250,0.10)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(167,139,250,0.18)]">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${cls} text-white shadow-lg`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Điểm tích luỹ (Loyalty) ── */}
        <section className="mt-5 rounded-3xl border border-violet-100 bg-white/90 p-6 shadow-[0_12px_30px_rgba(167,139,250,0.10)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
              <Sparkles size={18} className="text-cyan-500" /> Điểm tích luỹ
            </h2>
            {loyaltyError && (
              <button
                onClick={loadLoyalty}
                className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Thử lại
              </button>
            )}
          </div>

          {loyaltyLoading ? (
            <div className="mt-6 flex items-center justify-center py-6">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
            </div>
          ) : loyaltyError ? (
            <p className="mt-4 rounded-2xl bg-rose-50 py-3 text-center text-sm font-bold text-rose-600">
              {loyaltyError}
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-900">
                    {(loyalty?.points ?? 0).toLocaleString("vi-VN")}
                  </p>
                  <span className="text-sm font-bold text-slate-400">điểm</span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  Đổi {redeemTarget} điểm để nhận giảm 10% hóa đơn
                </p>
              </div>

              {/* Thanh tiến độ tới ngưỡng 400 điểm */}
              <div className="mt-3">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs font-semibold text-slate-400">
                  {progress >= 100
                    ? "Bạn đã đủ điểm để đổi ưu đãi!"
                    : `Còn ${redeemTarget - (loyalty?.points ?? 0)} điểm nữa đến ưu đãi (${progress}%)`}
                </p>
              </div>

              {/* Lịch sử điểm */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Lịch sử điểm
                </p>
                {(loyalty?.history?.length ?? 0) === 0 ? (
                  <p className="mt-3 rounded-2xl bg-slate-50 py-4 text-center text-sm font-semibold text-slate-400">
                    Bạn chưa có điểm nào — đặt món để bắt đầu tích điểm!
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-slate-100">
                    {loyalty!.history.slice(0, 5).map((h) => (
                      <li key={h.id} className="flex items-center gap-3 py-2.5">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                            h.type === "earn"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-orange-50 text-orange-500"
                          }`}
                        >
                          {h.type === "earn" ? "+" : "−"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-700">
                            {h.description}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(h.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-sm font-black ${
                            h.points >= 0 ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {h.points >= 0 ? "+" : "−"}
                          {Math.abs(h.points)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>

        {/* ── Nội dung 2 cột ── */}
        <section className="mt-5 grid gap-5 lg:grid-cols-2">

          {/* Thông tin cá nhân */}
          <div className="rounded-3xl border border-violet-100 bg-white/90 p-6 shadow-[0_12px_30px_rgba(167,139,250,0.10)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
                <UserIcon size={18} className="text-violet-500" /> Thông tin cá nhân
              </h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3.5 py-1.5 text-xs font-bold text-violet-600 transition hover:bg-violet-100">
                  <Pencil size={13} /> Sửa
                </button>
              )}
            </div>

            <form onSubmit={saveProfile} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Tên người dùng</span>
                <div className="relative">
                  <UserIcon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!editing}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-70"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Email</span>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!editing}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-70"
                  />
                </div>
              </label>

              {editing ? (
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 py-3 font-bold text-white shadow-lg shadow-violet-200 transition hover:opacity-90">
                    <Check size={17} /> Lưu thay đổi
                  </button>
                  <button type="button" onClick={() => { setEditing(false); setUsername(user.username); setEmail(user.email) }} className="flex items-center gap-1.5 rounded-full border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50">
                    <X size={16} /> Huỷ
                  </button>
                </div>
              ) : saved ? (
                <p className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3 text-sm font-bold text-emerald-600">
                  <CheckCircle2 size={17} /> Đã lưu thay đổi!
                </p>
              ) : null}
            </form>
          </div>
          {/* Đổi mật khẩu */}
          <div className="rounded-3xl border border-violet-100 bg-white/90 p-6 shadow-[0_12px_30px_rgba(167,139,250,0.10)] backdrop-blur">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
              <Lock size={18} className="text-cyan-500" /> Đổi mật khẩu
            </h2>

            <form onSubmit={changePassword} className="mt-5 space-y-4">
              {(
                [
                  { key: "current" as const, label: "Mật khẩu hiện tại" },
                  { key: "next" as const, label: "Mật khẩu mới" },
                  { key: "confirm" as const, label: "Nhập lại mật khẩu mới" },
                ]
              ).map(({ key, label }) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
                  <div className="relative">
                    <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPw[key] ? "text" : "password"}
                      value={pw[key]}
                      onChange={(e) => setPw({ ...pw, [key]: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 font-semibold text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw({ ...showPw, [key]: !showPw[key] })}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPw[key] ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
              ))}

              {pwMsg && (
                <p className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold ${pwMsg.ok ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  {pwMsg.ok ? <CheckCircle2 size={17} /> : <X size={17} />} {pwMsg.text}
                </p>
              )}

              <button type="submit" className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-bold text-white shadow-lg shadow-cyan-200 transition hover:opacity-90">
                Cập nhật mật khẩu
              </button>
            </form>
          </div>
        </section>

        {/* ── Vùng nguy hiểm ── */}
        <section className="mt-5 rounded-3xl border border-rose-200 bg-rose-50/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 font-black text-rose-700">
                <ShieldAlert size={18} /> Vùng nguy hiểm
              </h2>
              <p className="mt-1 text-sm text-rose-600/80">Xoá tài khoản vĩnh viễn cùng toàn bộ dữ liệu. Hành động này không thể hoàn tác.</p>
            </div>
            <button
              onClick={() => alert("Tính năng xoá tài khoản sẽ được kết nối API sau.")}
              className="rounded-full border border-rose-300 bg-white px-6 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
            >
              Xoá tài khoản
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}