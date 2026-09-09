import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { ReceiptText } from "lucide-react"
import { SectionTitle, StatusBadge } from "./sharedUI"
import { initialOrders } from "./mock"
import type { Section } from "./types"

const revenueWeek = [
  { day: "T2", value: 2.4 }, { day: "T3", value: 3.1 }, { day: "T4", value: 2.7 },
  { day: "T5", value: 3.9 }, { day: "T6", value: 5.2 }, { day: "T7", value: 6.4 },
  { day: "CN", value: 5.8 },
]
export default function Overview({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const stats = [
    { label: "Doanh thu hôm nay", value: "6,45tr", delta: "+18% vs hôm qua", icon: "💰", tone: "bg-emerald-100 text-emerald-700" },
    { label: "Đơn đang mở", value: "8", delta: "3 chờ thanh toán", icon: "🧾", tone: "bg-amber-100 text-amber-700" },
    { label: "Món bán chạy nhất", value: "Phở bò", delta: "1250 phần / tháng", icon: "🔥", tone: "bg-orange-100 text-orange-600" },
    { label: "Bàn đang có khách", value: "9/14", delta: "5 bàn trống", icon: "🪑", tone: "bg-violet-100 text-violet-600" },
  ]

  return (
    <div className="space-y-6">
      <SectionTitle title="Tổng quan" subtitle="Doanh thu toàn nhà hàng · Xin chào, Nguyễn Minh 👋" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${s.tone}`}>{s.icon}</div>
            <p className="mt-3 text-3xl font-black tabular-nums tracking-tight text-slate-900">{s.value}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">{s.label}</p>
            <p className="mt-0.5 text-xs font-bold text-emerald-600">▲ {s.delta}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-violet-100 bg-white/95 p-5 shadow-[0_16px_35px_rgba(167,139,250,0.08)] xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Doanh thu tuần này</h2>
              <p className="text-xs text-slate-500">Đơn vị: triệu đồng · 7 ngày gần nhất</p>
            </div>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <span className="rounded-md bg-white px-2.5 py-1 text-slate-800 shadow-sm">Ngày</span>
              <span className="rounded-md px-2.5 py-1">Tuần</span>
              <span className="rounded-md px-2.5 py-1">Tháng</span>
            </div>
          </div>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueWeek} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="tr" width={42} />
                <Tooltip
                  cursor={{ fill: "rgba(167,139,250,0.08)" }}
                  formatter={(v) => [`${v} triệu`, "Doanh thu"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #ede9fe", fontSize: 12 }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-violet-100 bg-white/95 p-5 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Đơn hàng mới nhất</h2>
            <button onClick={() => onNavigate("orders")} className="text-xs font-bold text-cyan-600 hover:text-cyan-700">Xem tất cả →</button>
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {initialOrders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center gap-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-500"><ReceiptText size={16} /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">Đơn #{o.id}</p>
                  <p className="text-xs text-slate-500">Bàn {o.table} · {o.items} món</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
