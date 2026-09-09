import { useState } from "react"
import { LogOut } from "lucide-react"
import { navItems } from "../components/dashboard/nav"
import type { Section } from "../components/dashboard/types"
import Overview from "../components/dashboard/Overview"
import Categories from "../components/dashboard/Categories"
import Dishes from "../components/dashboard/Dishes"
import Tables from "../components/dashboard/Tables"
import Orders from "../components/dashboard/Orders"
import Staff from "../components/dashboard/Staff"
import Loyalty from "../components/dashboard/Loyalty"

export default function Dashboard() {
  const [section, setSection] = useState<Section>("overview")

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] text-slate-800">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col gap-1 border-r border-violet-100 bg-white/85 p-4 backdrop-blur">
        <a href="/" className="mb-4 flex items-center gap-2.5 px-2 pt-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg shadow-md shadow-cyan-200">🍽️</span>
          <div>
            <p className="text-base font-black leading-none text-slate-900">Trackly</p>
            <p className="text-[11px] font-medium text-slate-500">Quản trị nhà hàng</p>
          </div>
        </a>

        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={
              section === item.id
                ? "flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-3 py-2.5 text-left text-sm font-bold text-white shadow-md shadow-violet-200"
                : "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"
            }
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-500 text-xs font-black text-white">NM</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-none text-slate-800">Nguyễn Minh</p>
            <p className="text-[11px] text-slate-500">Chủ nhà hàng</p>
          </div>
          <button className="text-slate-400 transition hover:text-red-500" title="Đăng xuất"><LogOut size={16} /></button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden p-6 lg:p-8">
        {section === "overview" && <Overview onNavigate={setSection} />}
        {section === "categories" && <Categories />}
        {section === "dishes" && <Dishes />}
        {section === "tables" && <Tables />}
        {section === "orders" && <Orders />}
        {section === "staff" && <Staff />}
        {section === "loyalty" && <Loyalty />}
      </main>
    </div>
  )
}

