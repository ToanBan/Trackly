import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ChefHat, Clock, Flame, CheckCircle2, Timer, StickyNote,
  PartyPopper, Inbox, RotateCcw, CheckCheck, LogIn, RefreshCw, Wifi, WifiOff,
} from "lucide-react"
import {
  getOrders, updateOrderStatus,
  type OrderResponse,
} from "@/api/orders"
import {
  createKitchenConnection, mapOrder,
  type KitchenOrder,
} from "@/api/signalr"

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function toneClass(elapsedMs: number): string {
  const m = elapsedMs / 60_000
  if (m >= 12) return "text-red-600 bg-red-100"
  if (m >= 7) return "text-orange-600 bg-orange-100"
  return "text-amber-700 bg-amber-100"
}

const statusMeta = {
  waiting: { label: "CHỜ LÀM", bar: "bg-yellow-400 text-black", Icon: Clock },
  cooking: { label: "ĐANG NẤU", bar: "bg-orange-400 text-black", Icon: Flame },
  done: { label: "HOÀN THÀNH", bar: "bg-emerald-500 text-white", Icon: CheckCircle2 },
} as const

type ConnState = "connecting" | "live" | "offline"

export default function Kitchen() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [clock, setClock] = useState(Date.now())
  const [filter, setFilter] = useState<"open" | "done">("open")
  const [needLogin, setNeedLogin] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [connState, setConnState] = useState<ConnState>("connecting")
  const connRef = useRef<ReturnType<typeof createKitchenConnection> | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Load danh sách đơn từ API ── */
  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoadError(null)
    try {
      const data: OrderResponse[] = await getOrders()
      setOrders(data.map(mapOrder))
      setNeedLogin(false)
      if (!silent) setLoadError(null)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 401) {
        setNeedLogin(true)
      } else if (!silent) {
        setLoadError(
          err instanceof Error && err.message
            ? err.message
            : "Không thể tải đơn hàng. Vui lòng thử lại.",
        )
      }
    }
  }, [])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  /* ── SignalR realtime: đơn mới đẩy ngay, reconnect thì resync ── */
  useEffect(() => {
    let cancelled = false
    const conn = createKitchenConnection()
    connRef.current = conn

    conn.on("orderCreated", (o: OrderResponse) => {
      // Bỏ qua đơn trùng (polling safety-net có thể đã lên trước đó)
      setOrders((prev) =>
        prev.some((x) => x.id === o.id) ? prev : [mapOrder(o), ...prev],
      )
    })

    // Reconnect sau khi đứt mạng -> event trong khoảng đứt có thể lỡ
    // -> resync bằng GET /orders (DB là nguồn sự thật).
    conn.onreconnected(() => {
      setConnState("live")
      void loadOrders(true)
    })

    conn.onclose(() => setConnState("offline"))
    conn.onreconnecting(() => setConnState("connecting"))

    void conn
      .start()
      .then(() => conn.invoke("JoinKitchen"))
      .then(() => {
        if (!cancelled) setConnState("live")
      })
      .catch(() => {
        if (!cancelled) setConnState("offline")
      })

    return () => {
      cancelled = true
      connRef.current = null
      void conn.stop()
    }
  }, [loadOrders])

  /* ── Safety-net polling: khi realtime chưa live, hỏi DB mỗi 30s ── */
  useEffect(() => {
    if (connState === "live") {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      return
    }
    pollingRef.current = setInterval(() => void loadOrders(true), 30_000)
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [connState, loadOrders])

  /* ── Đổi trạng thái đơn: gọi API trước, state theo response server ── */
  const toggleDone = async (id: number) => {
    const current = orders.find((o) => o.id === id)
    if (!current) return
    const nextStatus = current.status === "done" ? "Preparing" : "Served"
    try {
      const updated = await updateOrderStatus(id, nextStatus)
      setOrders((prev) => prev.map((o) => (o.id === id ? mapOrder(updated) : o)))
    } catch {
      // Lỗi -> giữ nguyên state, đơn vẫn hiển thị đúng server ở lần resync sau.
    }
  }

  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const open = orders.filter((o) => o.status !== "done")
  const done = orders.filter((o) => o.status === "done")
  const shown = filter === "open" ? open : done

  const time = new Date(clock)
  const hh = time.getHours().toString().padStart(2, "0")
  const mm = time.getMinutes().toString().padStart(2, "0")

  /* ── Chưa đăng nhập: endpoint GET /orders trả 401 ── */
  if (needLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] px-4">
        <div className="w-full max-w-xl rounded-3xl border border-violet-100 bg-white/90 p-10 text-center shadow-[0_20px_50px_rgba(167,139,250,0.15)]">
          <LogIn size={56} className="mx-auto text-violet-400" />
          <h1 className="mt-4 text-3xl font-black text-slate-900">Cần đăng nhập</h1>
          <p className="mt-2 text-slate-500">
            Màn hình bếp yêu cầu đăng nhập bằng tài khoản nhân viên để xem đơn
            hàng.
          </p>
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

  const connBadge =
    connState === "live"
      ? { text: "LIVE", cls: "bg-emerald-50 text-emerald-600", Icon: Wifi }
      : connState === "connecting"
        ? { text: "Đang kết nối", cls: "bg-amber-50 text-amber-600", Icon: RefreshCw }
        : { text: "Offline", cls: "bg-rose-50 text-rose-500", Icon: WifiOff }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] text-slate-800">
      <div className="mx-auto max-w-[1400px] px-4 py-4">

        <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-violet-100 bg-white/80 px-5 py-3.5 shadow-[0_10px_30px_rgba(167,139,250,0.10)] backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white">
              <ChefHat size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black leading-none tracking-tight text-slate-900">Bếp — Kitchen Display</h1>
              <p className="text-sm text-slate-500">Màn hình theo dõi đơn hàng của bếp</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Badge trạng thái realtime — bếp biết ngay khi kết nối rớt */}
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${connBadge.cls}`}>
              <connBadge.Icon size={14} /> {connBadge.text}
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-white/80 px-4 py-2">
              <Clock size={28} className="text-violet-500" />
              <span className="text-4xl font-black tabular-nums text-slate-800">{hh}:{mm}</span>
            </div>
          </div>
        </header>

        {loadError && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3">
            <p className="text-sm font-bold text-rose-600">{loadError}</p>
            <button
              onClick={() => void loadOrders()}
              className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-black text-white hover:bg-rose-700"
            >
              Thử lại
            </button>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setFilter("open")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-lg font-black transition-all duration-200 hover:-translate-y-0.5 ${filter === "open" ? "border-yellow-300 bg-gradient-to-r from-yellow-300 to-amber-300 text-black shadow-[0_8px_18px_rgba(251,191,36,0.35)]" : "border-slate-200 bg-white/80 text-slate-700 hover:bg-yellow-50"}`}
          >
            <Timer size={22} /> Chưa hoàn thành · {open.length}
          </button>
          <button
            onClick={() => setFilter("done")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-lg font-black transition-all duration-200 hover:-translate-y-0.5 ${filter === "done" ? "border-emerald-300 bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-[0_8px_18px_rgba(16,185,129,0.35)]" : "border-slate-200 bg-white/80 text-slate-700 hover:bg-emerald-50"}`}
          >
            <CheckCheck size={22} /> Hoàn thành · {done.length}
          </button>
        </div>
<div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {shown.map((order) => {
            const elapsed = clock - order.placedAt
            const meta = statusMeta[order.status]
            const isDone = order.status === "done"
            const StatusIcon = meta.Icon
            return (
              <article
                key={order.id}
                className={`relative flex flex-col overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_45px_rgba(167,139,250,0.18)] ${
                  isDone ? "border-emerald-200 bg-emerald-50/80" : "border-violet-100 bg-white/90 shadow-[0_14px_30px_rgba(167,139,250,0.10)]"
                }`}
              >
                {/* Thanh màu trạng thái trên cùng */}
                <div className={`h-1.5 w-full ${isDone ? "bg-gradient-to-r from-emerald-400 to-teal-400" : order.status === "cooking" ? "bg-gradient-to-r from-orange-300 to-amber-400" : "bg-gradient-to-r from-yellow-300 to-amber-300"}`} />

                <div className="flex items-center justify-between gap-2 px-4 pt-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black ${meta.bar}`}>
                    <StatusIcon size={16} /> {meta.label}
                  </span>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-black tabular-nums text-emerald-700">
                      <CheckCircle2 size={16} /> {formatElapsed(elapsed)}
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black tabular-nums ${toneClass(elapsed)}`}>
                      <Timer size={16} /> {formatElapsed(elapsed)}
                    </span>
                  )}
                </div>

                <div className="flex items-end justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Bàn</p>
                    <p className={`text-5xl font-black leading-none ${isDone ? "text-slate-300" : "bg-gradient-to-br from-slate-800 to-slate-500 bg-clip-text text-transparent"}`}>{order.table}</p>
                  </div>
                  <div className="rounded-xl bg-violet-50 px-3 py-1.5 text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">Đơn</p>
                    <p className={`text-xl font-black tabular-nums ${isDone ? "text-slate-300" : "text-violet-600"}`}>#{order.id}</p>
                  </div>
                </div>
<div className="mt-2 flex-1 space-y-1.5 px-4">
                  {order.items.map((it) => (
                    <div
                      key={it.name}
                      className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 text-2xl font-bold leading-tight transition-colors ${
                        isDone ? "bg-slate-100/80 text-slate-400" : "bg-slate-50 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <span className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full px-1 font-black ${
                        isDone ? "bg-slate-200 text-slate-400" : "bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-sm"
                      }`}>×{it.qty}</span>
                      <span className="min-w-0 flex-1 truncate">{it.name}</span>
                      {it.note && !isDone && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                          <StickyNote size={12} /> {it.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => toggleDone(order.id)}
                  className={`mx-4 mb-4 mt-3 flex w-[calc(100%-2rem)] flex-none items-center justify-center gap-2 py-4 text-2xl font-black tracking-wide transition-all duration-200 active:scale-95 ${
                    isDone
                      ? "rounded-full bg-emerald-500 text-white shadow-[0_6px_18px_rgba(16,185,129,0.35)] hover:bg-emerald-400"
                      : "rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-black shadow-[0_8px_20px_rgba(251,146,60,0.35)] hover:from-amber-300 hover:to-orange-300 hover:shadow-[0_10px_25px_rgba(251,146,60,0.45)]"
                  }`}
                >
                  {isDone ? <RotateCcw size={24} /> : <CheckCircle2 size={24} />}
                  {isDone ? "Mở lại đơn" : "HOÀN THÀNH"}
                </button>
              </article>
            )
          })}
        </div>

        {filter === "open" && open.length === 0 && (
          <div className="mt-10 rounded-3xl border border-emerald-300 bg-emerald-50 p-10 text-center">
            <PartyPopper size={64} className="mx-auto text-emerald-600" />
            <h2 className="mt-3 text-5xl font-black text-emerald-700">Tất cả đơn đã được phục vụ!</h2>
          </div>
        )}
        {filter === "done" && done.length === 0 && (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white/80 p-10 text-center">
            <Inbox size={56} className="mx-auto text-slate-400" />
            <h2 className="mt-3 text-4xl font-black text-slate-600">Chưa có đơn nào hoàn thành.</h2>
          </div>
        )}
      </div>
    </div>
  )
}