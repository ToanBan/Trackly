import { useState, type FormEvent, type ReactNode } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import {
  LayoutDashboard, FolderTree, UtensilsCrossed, Armchair, ReceiptText, Users, Star,
  Plus, Pencil, Trash2, X, Eye, Download, LogOut, QrCode, Gift,
} from "lucide-react"

/* ═════════════════════════════════════════════════════════════════
   Dashboard — Trang tổng quan cho chủ nhà hàng (owner/admin)
   Sidebar + content · Light theme · Icons: lucide-react
   CRUD modal hoạt động thật trên dữ liệu mock (useState).
   ═════════════════════════════════════════════════════════════════ */

type Section =
  | "overview" | "categories" | "dishes" | "tables" | "orders" | "staff" | "loyalty"

type Category = { id: number; name: string; emoji: string; dishes: number }
type Dish = { id: number; name: string; category: string; image: string; price: number; available: boolean }
type Table = { id: number; name: string; seats: number; occupied: boolean; qr: string }
type Order = { id: number; table: string; items: number; total: number; status: "Open" | "Checkout" | "Paid" }
type Staff = { id: number; name: string; role: string; phone: string; active: boolean }
type Customer = { id: number; name: string; phone: string; points: number; tier: string }

const navItems: { id: Section; label: string; icon: ReactNode }[] = [
  { id: "overview", label: "Tổng quan", icon: <LayoutDashboard size={17} /> },
  { id: "categories", label: "Danh mục món", icon: <FolderTree size={17} /> },
  { id: "dishes", label: "Món ăn", icon: <UtensilsCrossed size={17} /> },
  { id: "tables", label: "Bàn ăn", icon: <Armchair size={17} /> },
  { id: "orders", label: "Đơn hàng", icon: <ReceiptText size={17} /> },
  { id: "staff", label: "Nhân viên", icon: <Users size={17} /> },
  { id: "loyalty", label: "Khách hàng thân thiết", icon: <Star size={17} /> },
]

/* ── Mock data ─────────────────────────────────────────────── */
const revenueWeek = [
  { day: "T2", value: 2.4 }, { day: "T3", value: 3.1 }, { day: "T4", value: 2.7 },
  { day: "T5", value: 3.9 }, { day: "T6", value: 5.2 }, { day: "T7", value: 6.4 },
  { day: "CN", value: 5.8 },
]

const initialCategories: Category[] = [
  { id: 1, name: "Món chính", emoji: "🍚", dishes: 8 },
  { id: 2, name: "Phở & Bún", emoji: "🍜", dishes: 6 },
  { id: 3, name: "Món nướng", emoji: "🍢", dishes: 9 },
  { id: 4, name: "Đồ uống", emoji: "🥤", dishes: 12 },
  { id: 5, name: "Tráng miệng", emoji: "🍰", dishes: 5 },
]

const initialDishes: Dish[] = [
  { id: 1, name: "Phở bò đặc biệt", category: "Phở & Bún", image: "https://placehold.co/80x80/e2e8f0/64748b?text=Phở", price: 55000, available: true },
  { id: 2, name: "Bò nướng lá lốt", category: "Món nướng", image: "https://placehold.co/80x80/e2e8f0/64748b?text=Bò", price: 89000, available: true },
  { id: 3, name: "Cơm tấm sườn nướng", category: "Món chính", image: "https://placehold.co/80x80/e2e8f0/64748b?text=Cơm", price: 45000, available: false },
  { id: 4, name: "Sò điệp nướng", category: "Món nướng", image: "https://placehold.co/80x80/e2e8f0/64748b?text=Sò", price: 75000, available: true },
  { id: 5, name: "Cà phê sữa đá", category: "Đồ uống", image: "https://placehold.co/80x80/e2e8f0/64748b?text=CF", price: 25000, available: false },
]

const initialTables: Table[] = [
  { id: 1, name: "Bàn 01", seats: 2, occupied: true, qr: "TRACKLY-T01" },
  { id: 2, name: "Bàn 02", seats: 4, occupied: false, qr: "TRACKLY-T02" },
  { id: 3, name: "Bàn 03", seats: 4, occupied: true, qr: "TRACKLY-T03" },
  { id: 4, name: "Bàn 05", seats: 6, occupied: true, qr: "TRACKLY-T05" },
  { id: 5, name: "Bàn 08", seats: 2, occupied: false, qr: "TRACKLY-T08" },
  { id: 6, name: "Bàn 12", seats: 8, occupied: true, qr: "TRACKLY-T12" },
]

const initialOrders: Order[] = [
  { id: 1042, table: "12", items: 3, total: 145000, status: "Open" },
  { id: 1043, table: "05", items: 6, total: 289000, status: "Open" },
  { id: 1044, table: "03", items: 4, total: 198000, status: "Checkout" },
  { id: 1045, table: "08", items: 2, total: 96000, status: "Paid" },
  { id: 1046, table: "21", items: 5, total: 312000, status: "Checkout" },
  { id: 1047, table: "01", items: 3, total: 128000, status: "Paid" },
]

const initialStaff: Staff[] = [
  { id: 1, name: "Trần Văn Bếp", role: "Đầu bếp", phone: "0901 234 567", active: true },
  { id: 2, name: "Lê Thị Phục", role: "Phục vụ", phone: "0902 345 678", active: true },
  { id: 3, name: "Phạm Văn Nướng", role: "Đầu bếp", phone: "0903 456 789", active: false },
  { id: 4, name: "Hoàng Thị Thu", role: "Thu ngân", phone: "0904 567 890", active: true },
]

const initialCustomers: Customer[] = [
  { id: 1, name: "Nguyễn Văn A", phone: "0911 111 111", points: 2450, tier: "Vàng" },
  { id: 2, name: "Trần Thị B", phone: "0922 222 222", points: 1180, tier: "Bạc" },
  { id: 3, name: "Lê Văn C", phone: "0933 333 333", points: 5600, tier: "Kim cương" },
  { id: 4, name: "Phạm Thị D", phone: "0944 444 444", points: 320, tier: "Thành viên" },
]
/* ── Helpers & UI dùng chung ───────────────────────────────── */
function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ"
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    Open: "bg-amber-100 text-amber-700",
    Checkout: "bg-cyan-100 text-cyan-700",
    Paid: "bg-emerald-100 text-emerald-700",
  }
  const label: Record<Order["status"], string> = {
    Open: "Đang mở", Checkout: "Thanh toán", Paid: "Đã trả",
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${map[status]}`}>{label[status]}</span>
  )
}

function tierClass(tier: string): string {
  if (tier === "Kim cương") return "bg-cyan-100 text-cyan-700"
  if (tier === "Vàng") return "bg-amber-100 text-amber-700"
  if (tier === "Bạc") return "bg-slate-200 text-slate-700"
  return "bg-violet-100 text-violet-700"
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
      <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

function ActionButton({ label, icon, onClick }: { label: string; icon?: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:opacity-90"
    >
      {icon}
      {label}
    </button>
  )
}

/* ── Modal dùng chung cho Thêm / Sửa ──────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-violet-100 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Modal xác nhận xoá ───────────────────────────────────── */
function ConfirmDialog({ title, message, onCancel, onConfirm }: {
  title: string; message: string; onCancel: () => void; onConfirm: () => void
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Huỷ</button>
        <button onClick={onConfirm} className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-red-200 transition hover:bg-red-600">Xoá</button>
      </div>
    </Modal>
  )
}

/* ── Field input dùng chung trong modal ───────────────────── */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
/* ═════════════════════════════════════════════════════════════════
   Component chính — Sidebar + Content
   ═════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [section, setSection] = useState<Section>("overview")

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] text-slate-800">
      {/* ── Sidebar ───────────────────────────────────────────── */}
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

      {/* ── Content ───────────────────────────────────────────── */}
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
/* ═══ Tổng quan ═════════════════════════════════════════════════ */
function Overview({ onNavigate }: { onNavigate: (s: Section) => void }) {
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
/* ═══ Danh mục món (CRUD + Modal) ════════════════════════════ */
function Categories() {
  const [items, setItems] = useState<Category[]>(initialCategories)
  const [editing, setEditing] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: "", emoji: "", dishes: 0 })

  const openAdd = () => { setEditing(null); setForm({ name: "", emoji: "🍚", dishes: 0 }); setShowForm(true) }
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, emoji: c.emoji, dishes: c.dishes }); setShowForm(true) }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editing) {
      setItems(items.map((c) => (c.id === editing.id ? { ...c, ...form } : c)))
    } else {
      setItems([...items, { id: Date.now(), ...form }])
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Danh mục món" subtitle="Quản lý các nhóm món trong thực đơn" />
      <ActionButton label="Thêm danh mục" icon={<Plus size={16} />} onClick={openAdd} />

      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white/95 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Tên danh mục</th>
              <th className="px-5 py-3">Emoji</th>
              <th className="px-5 py-3">Số món</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((c) => (
              <tr key={c.id} className="transition hover:bg-violet-50/40">
                <td className="px-5 py-3 font-bold text-slate-800">{c.name}</td>
                <td className="px-5 py-3 text-xl">{c.emoji}</td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{c.dishes} món</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"><Pencil size={13} /> Sửa</button>
                  <span className="mx-2 text-slate-300">·</span>
                  <button onClick={() => setDeleting(c)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600"><Trash2 size={13} /> Xoá</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">Chưa có danh mục nào.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {showForm && (
        <Modal title={editing ? "Sửa danh mục" : "Thêm danh mục"} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Tên danh mục">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Món nướng" autoFocus />
            </Field>
            <Field label="Emoji">
              <input className={inputClass} value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🍢" />
            </Field>
            <Field label="Số món">
              <input type="number" min={0} className={inputClass} value={form.dishes} onChange={(e) => setForm({ ...form, dishes: Number(e.target.value) })} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Huỷ</button>
              <button type="submit" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90">
                {editing ? "Lưu thay đổi" : "Thêm mới"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Xoá danh mục"
          message={`Bạn có chắc muốn xoá danh mục "${deleting.name}"? Hành động này không thể hoàn tác.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { setItems(items.filter((c) => c.id !== deleting.id)); setDeleting(null) }}
        />
      )}
    </div>
  )
}
/* ═══ Món ăn (CRUD + Modal: ảnh, giá, còn/hết) ═══════════════ */
function Dishes() {
  const [items, setItems] = useState<Dish[]>(initialDishes)
  const [editing, setEditing] = useState<Dish | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Dish | null>(null)
  const [form, setForm] = useState({ name: "", category: initialCategories[0].name, image: "", price: 0, available: true })

  const openAdd = () => {
    setEditing(null)
    setForm({ name: "", category: initialCategories[0].name, image: "", price: 0, available: true })
    setShowForm(true)
  }
  const openEdit = (d: Dish) => {
    setEditing(d)
    setForm({ name: d.name, category: d.category, image: d.image, price: d.price, available: d.available })
    setShowForm(true)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const image = form.image.trim() || `https://placehold.co/80x80/e2e8f0/64748b?text=${encodeURIComponent(form.name.slice(0, 3))}`
    if (editing) {
      setItems(items.map((d) => (d.id === editing.id ? { ...d, ...form, image } : d)))
    } else {
      setItems([...items, { id: Date.now(), ...form, image }])
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Món ăn" subtitle="Danh sách món: ảnh, giá, trạng thái còn/hết hàng" />
      <ActionButton label="Thêm món ăn" icon={<Plus size={16} />} onClick={openAdd} />

      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white/95 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Món ăn</th>
              <th className="px-5 py-3">Danh mục</th>
              <th className="px-5 py-3">Giá</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((d) => (
              <tr key={d.id} className="transition hover:bg-violet-50/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={d.image} alt={d.name} className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-bold text-slate-800">{d.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{d.category}</td>
                <td className="px-5 py-3 font-bold tabular-nums text-slate-800">{formatPrice(d.price)}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setItems(items.map((x) => (x.id === d.id ? { ...x, available: !x.available } : x)))}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${d.available ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                    title="Bấm để đổi trạng thái"
                  >
                    {d.available ? "● Còn hàng" : "○ Hết hàng"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(d)} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"><Pencil size={13} /> Sửa</button>
                  <span className="mx-2 text-slate-300">·</span>
                  <button onClick={() => setDeleting(d)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600"><Trash2 size={13} /> Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {showForm && (
        <Modal title={editing ? "Sửa món ăn" : "Thêm món ăn"} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Tên món">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Bánh flan" autoFocus />
            </Field>
            <Field label="Danh mục">
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {initialCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Link ảnh (tuỳ chọn)">
              <input className={inputClass} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Giá (đ)">
              <input type="number" min={0} step={1000} className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="h-4 w-4 accent-violet-500" />
              Còn hàng
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Huỷ</button>
              <button type="submit" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90">
                {editing ? "Lưu thay đổi" : "Thêm mới"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Xoá món ăn"
          message={`Bạn có chắc muốn xoá món "${deleting.name}"? Hành động này không thể hoàn tác.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { setItems(items.filter((d) => d.id !== deleting.id)); setDeleting(null) }}
        />
      )}
    </div>
  )
}

/* ═══ Bàn ăn (CRUD + Modal + QR) ═════════════════════════════ */
function Tables() {
  const [items, setItems] = useState<Table[]>(initialTables)
  const [editing, setEditing] = useState<Table | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Table | null>(null)
  const [form, setForm] = useState({ name: "", seats: 4 })

  const openAdd = () => { setEditing(null); setForm({ name: "", seats: 4 }); setShowForm(true) }
  const openEdit = (t: Table) => { setEditing(t); setForm({ name: t.name, seats: t.seats }); setShowForm(true) }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editing) {
      setItems(items.map((t) => (t.id === editing.id ? { ...t, name: form.name, seats: form.seats } : t)))
    } else {
      const id = Date.now()
      setItems([...items, { id, name: form.name, seats: form.seats, occupied: false, qr: `TRACKLY-T${String(id).slice(-3)}` }])
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Bàn ăn" subtitle="Quản lý bàn & mã QR để khách quét vào gọi món" />
      <ActionButton label="Thêm bàn" icon={<Plus size={16} />} onClick={openAdd} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((t) => (
          <div key={t.id} className="rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500 ${t.occupied ? "bg-violet-100" : "bg-emerald-100"}`}><Armchair size={22} /></div>
                <div>
                  <p className="text-base font-black text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.seats} chỗ ngồi</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${t.occupied ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                {t.occupied ? "Có khách" : "Trống"}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
              <div className="grid h-14 w-14 shrink-0 grid-cols-4 grid-rows-4 gap-px rounded-md bg-white p-1 shadow-sm">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className={(i * 7 + t.id * 3) % 3 === 0 ? "bg-slate-900" : "bg-transparent"} />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"><QrCode size={12} /> Mã QR bàn</p>
                <p className="truncate font-mono text-xs font-bold text-slate-800">{t.qr}</p>
              </div>
              <button className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"><Download size={13} /> Tải</button>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => openEdit(t)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-slate-200 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"><Pencil size={13} /> Sửa</button>
              <button onClick={() => setDeleting(t)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-red-100 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50"><Trash2 size={13} /> Xoá</button>
            </div>
          </div>
        ))}
      </section>

      {showForm && (
        <Modal title={editing ? "Sửa bàn" : "Thêm bàn"} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Tên bàn">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Bàn 15" autoFocus />
            </Field>
            <Field label="Số chỗ ngồi">
              <input type="number" min={1} className={inputClass} value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Huỷ</button>
              <button type="submit" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90">
                {editing ? "Lưu thay đổi" : "Thêm mới"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Xoá bàn"
          message={`Bạn có chắc muốn xoá "${deleting.name}"? Mã QR của bàn cũng sẽ bị xoá.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { setItems(items.filter((t) => t.id !== deleting.id)); setDeleting(null) }}
        />
      )}
    </div>
  )
}
/* ═══ Đơn hàng (lọc trạng thái + modal chi tiết) ═════════════ */
function Orders() {
  const [filter, setFilter] = useState<"Tất cả" | Order["status"]>("Tất cả")
  const [detail, setDetail] = useState<Order | null>(null)
  const filters: ("Tất cả" | Order["status"])[] = ["Tất cả", "Open", "Checkout", "Paid"]
  const filtered = filter === "Tất cả" ? initialOrders : initialOrders.filter((o) => o.status === filter)
  const label: Record<string, string> = { Open: "🟡 Đang mở", Checkout: "🔵 Chờ thanh toán", Paid: "🟢 Đã trả", "Tất cả": "Tất cả" }

  return (
    <div className="space-y-6">
      <SectionTitle title="Đơn hàng" subtitle="Danh sách đơn · lọc theo trạng thái" />

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
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Mã đơn</th>
              <th className="px-5 py-3">Bàn</th>
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
                <td className="px-5 py-3 text-slate-600">Bàn {o.table}</td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{o.items} món</td>
                <td className="px-5 py-3 font-bold tabular-nums text-slate-800">{formatPrice(o.total)}</td>
                <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setDetail(o)} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"><Eye size={13} /> Chi tiết</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">Không có đơn hàng nào ở trạng thái này.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {detail && (
        <Modal title={`Chi tiết đơn #${detail.id}`} onClose={() => setDetail(null)}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Bàn</span><span className="font-bold text-slate-800">Bàn {detail.table}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Số món</span><span className="font-bold text-slate-800">{detail.items} món</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Trạng thái</span><StatusBadge status={detail.status} /></div>
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-700">Tổng tiền</span>
              <span className="text-lg font-black tabular-nums text-violet-600">{formatPrice(detail.total)}</span>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setDetail(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Đóng</button>
            <button
              onClick={() => {
                setDetail(null)
              }}
              className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90"
            >
              In hoá đơn
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
/* ═══ Nhân viên (CRUD + Modal) ═══════════════════════════════ */
function Staff() {
  const [items, setItems] = useState<Staff[]>(initialStaff)
  const [editing, setEditing] = useState<Staff | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Staff | null>(null)
  const [form, setForm] = useState({ name: "", role: "Phục vụ", phone: "", active: true })

  const openAdd = () => { setEditing(null); setForm({ name: "", role: "Phục vụ", phone: "", active: true }); setShowForm(true) }
  const openEdit = (s: Staff) => { setEditing(s); setForm({ name: s.name, role: s.role, phone: s.phone, active: s.active }); setShowForm(true) }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editing) {
      setItems(items.map((s) => (s.id === editing.id ? { ...s, ...form } : s)))
    } else {
      setItems([...items, { id: Date.now(), ...form }])
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Nhân viên" subtitle="Quản lý tài khoản đầu bếp, phục vụ, thu ngân" />
      <ActionButton label="Thêm nhân viên" icon={<Plus size={16} />} onClick={openAdd} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-cyan-500 text-sm font-black text-white">
              {s.name.split(" ").map((w) => w[0]).slice(-2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">{s.name}</p>
              <p className="truncate text-xs text-slate-500">{s.role} · {s.phone}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {s.active ? "Đang làm" : "Nghỉ"}
            </span>
            <button onClick={() => openEdit(s)} className="shrink-0 rounded-full p-1.5 text-cyan-600 transition hover:bg-cyan-50" title="Sửa"><Pencil size={14} /></button>
            <button onClick={() => setDeleting(s)} className="shrink-0 rounded-full p-1.5 text-red-500 transition hover:bg-red-50" title="Xoá"><Trash2 size={14} /></button>
          </div>
        ))}
      </section>

      {showForm && (
        <Modal title={editing ? "Sửa nhân viên" : "Thêm nhân viên"} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Họ tên">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Nguyễn Văn B" autoFocus />
            </Field>
            <Field label="Vai trò">
              <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option>Đầu bếp</option>
                <option>Phục vụ</option>
                <option>Thu ngân</option>
              </select>
            </Field>
            <Field label="Số điện thoại">
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0900 000 000" />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-violet-500" />
              Đang làm việc
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Huỷ</button>
              <button type="submit" className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90">
                {editing ? "Lưu thay đổi" : "Thêm mới"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Xoá nhân viên"
          message={`Bạn có chắc muốn xoá tài khoản của "${deleting.name}"?`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => { setItems(items.filter((s) => s.id !== deleting.id)); setDeleting(null) }}
        />
      )}
    </div>
  )
}
/* ═══ Khách hàng thân thiết (Loyalty) ════════════════════════ */
function Loyalty() {
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