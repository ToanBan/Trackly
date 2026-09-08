import { useEffect, useState } from "react"
import {
  ChefHat, Clock, Flame, CheckCircle2, Timer, StickyNote,
  PartyPopper, Inbox, RotateCcw, CheckCheck,
} from "lucide-react"

type OrderStatus = "waiting" | "cooking" | "done"

type OrderItem = {
  name: string
  qty: number
  note?: string
}

type Order = {
  id: number
  table: string
  placedAt: number
  status: OrderStatus
  items: OrderItem[]
}

const now = Date.now()
const min = 60_000

const seedOrders: Order[] = [
  {
    id: 1042,
    table: "12",
    placedAt: now - 2 * min,
    status: "waiting",
    items: [
      { name: "Phở bò đặc biệt", qty: 2 },
      { name: "Sò điệp nướng", qty: 1, note: "Không cay" },
    ],
  },
  {
    id: 1043,
    table: "05",
    placedAt: now - 6 * min,
    status: "cooking",
    items: [
      { name: "Bò nướng lá lốt", qty: 1 },
      { name: "Cơm gà xối mỡ", qty: 2 },
      { name: "Sinh tố mát", qty: 3 },
    ],
  },
  {
    id: 1044,
    table: "21",
    placedAt: now - 11 * min,
    status: "cooking",
    items: [
      { name: "Bánh mì thịt nướng", qty: 4 },
      { name: "Cà phê sữa đá", qty: 2, note: "Nhiều đá" },
    ],
  },
  {
    id: 1045,
    table: "08",
    placedAt: now - 16 * min,
    status: "waiting",
    items: [
      { name: "Bún bò Huế", qty: 3 },
      { name: "Phở bò đặc biệt", qty: 1 },
    ],
  },
  {
    id: 1046,
    table: "03",
    placedAt: now - 1 * min,
    status: "waiting",
    items: [{ name: "Cơm tấm sườn nướng", qty: 2 }],
  },
  {
    id: 1039,
    table: "17",
    placedAt: now - 22 * min,
    status: "done",
    items: [
      { name: "Heo rừng cuộn nướng", qty: 2 },
      { name: "Sò điệp nướng", qty: 1 },
    ],
  },
]

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function toneClass(elapsedMs: number): string {
  const m = elapsedMs / min
  if (m >= 12) return "text-red-600 bg-red-100"
  if (m >= 7) return "text-orange-600 bg-orange-100"
  return "text-amber-700 bg-amber-100"
}

const statusMeta = {
  waiting: { label: "CHỜ LÀM", bar: "bg-yellow-400 text-black", Icon: Clock },
  cooking: { label: "ĐANG NẤU", bar: "bg-orange-400 text-black", Icon: Flame },
  done: { label: "HOÀN THÀNH", bar: "bg-emerald-500 text-white", Icon: CheckCircle2 },
} as const
export default function Kitchen() {
  const [orders, setOrders] = useState(seedOrders)
  const [clock, setClock] = useState(Date.now())
  const [filter, setFilter] = useState<"open" | "done">("open")

  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const toggleDone = (id: number) => {
    setOrders(
      orders.map((o) =>
        o.id === id ? { ...o, status: o.status === "done" ? "waiting" : "done" } : o,
      ),
    )
  }

  const open = orders.filter((o) => o.status !== "done")
  const done = orders.filter((o) => o.status === "done")
  const shown = filter === "open" ? open : done

  const time = new Date(clock)
  const hh = time.getHours().toString().padStart(2, "0")
  const mm = time.getMinutes().toString().padStart(2, "0")

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
          <div className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-white/80 px-4 py-2">
            <Clock size={28} className="text-violet-500" />
            <span className="text-4xl font-black tabular-nums text-slate-800">{hh}:{mm}</span>
          </div>
        </header>

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