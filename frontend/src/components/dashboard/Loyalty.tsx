import { useState } from "react"
import { Gift } from "lucide-react"
import type { Customer } from "./types"
import { initialCustomers } from "./mock"
import { SectionTitle, tierClass } from "./sharedUI"
export default function Loyalty() {
  const [items] = useState<Customer[]>(initialCustomers)

  return (
    <div className="space-y-6">
      <SectionTitle title="Khách hàng thân thiết" subtitle="Điểm tích luỹ & hạng thành viên" />

      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white/95 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Khách hàng</th>
              <th className="px-5 py-3">Số điện thoại</th>
              <th className="px-5 py-3">Điểm</th>
              <th className="px-5 py-3">Hạng</th>
              <th className="px-5 py-3 text-right">Quà tặng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((c) => (
              <tr key={c.id} className="transition hover:bg-violet-50/40">
                <td className="px-5 py-3 font-bold text-slate-800">{c.name}</td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{c.phone}</td>
                <td className="px-5 py-3 font-black tabular-nums text-violet-600">{c.points.toLocaleString("vi-VN")}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tierClass(c.tier)}`}>{c.tier}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"><Gift size={13} /> Đổi quà</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
