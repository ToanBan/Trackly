import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Category } from "./types"
import { initialCategories } from "./mock"
import { SectionTitle, ActionButton, Modal, ConfirmDialog, Field, inputClass } from "./sharedUI"
export default function Categories() {
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
