import { useState, type FormEvent } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Dish } from "./types"
import { initialCategories, initialDishes } from "./mock"
import { SectionTitle, ActionButton, Modal, ConfirmDialog, Field, inputClass, formatPrice } from "./sharedUI"
export default function Dishes() {
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

