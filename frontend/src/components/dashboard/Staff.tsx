import { useState, type FormEvent } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Staff } from "./types"
import { initialStaff } from "./mock"
import { SectionTitle, ActionButton, Modal, ConfirmDialog, Field, inputClass } from "./sharedUI"
export default function Staff() {
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
