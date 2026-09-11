import { useState, useEffect, type FormEvent } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Category } from "./types"
import { SectionTitle, ActionButton, Modal, ConfirmDialog, Field, inputClass } from "./sharedUI"
import { listCategories, createCategory, updateCategory, deleteCategory, resolveImageUrl } from "../../api/categories"
import { listDishes } from "../../api/dishes"

export default function Categories() {
  const [items, setItems] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", isActive: true })
  const [image, setImage] = useState<File | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  async function refresh(cancelled = false) {
    const cats = await listCategories(PAGE_SIZE, page)
    const dishList = await listDishes(1000, 1)
    if (cancelled) return
    setItems(
      cats.map((c) => ({
        ...c,
        dishes: dishList.filter((d) => d.categoryId === c.id).length,
      })),
    )
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void (async () => {
      try {
        await refresh(cancelled)
      } catch {
        setError("Kiểm thử kết nối với server.")
      } finally {
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: "", description: "", isActive: true })
    setImage(null)
    setShowForm(true)
  }
  const openEdit = (c: Category) => {
    setEditing(c)
    setForm({ name: c.name, description: c.description ?? "", isActive: c.isActive })
    setImage(null)
    setShowForm(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setBusy(true)
    try {
      if (editing) {
        await updateCategory(editing.id, { name: form.name.trim(), description: form.description, isActive: form.isActive })
      } else {
        await createCategory({ name: form.name.trim(), description: form.description, image })
      }
      setShowForm(false)
      await refresh()
    } catch {
      setError("Không nẹ thể lưu danh mục. Đăng nhập đã hồk và kiểm thử lại.")
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await deleteCategory(deleting.id)
      setDeleting(null)
      await refresh()
    } catch {
      setError("Không nẹ thể xoá danh mục này. Có món ăn đang dùng nó?")
    } finally {
      setBusy(false)
    }
  }

  const img = (c: Category) => resolveImageUrl(c.imageUrl)

  return (
    <div className="space-y-6">
      <SectionTitle title="Danh mục món" subtitle="Quản lý các nhóm món trong thực đơn" />
      <ActionButton label="Thêm danh mục" icon={<Plus size={16} />} onClick={openAdd} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white/95 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Tên danh mục</th>
              <th className="px-5 py-3">Mô Tả</th>
              <th className="px-5 py-3">Số món</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((c) => (
              <tr key={c.id} className="transition hover:bg-violet-50/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {img(c) && <img src={img(c)!} alt={c.name} className="h-10 w-10 rounded-lg object-cover" />}
                    <span className="font-bold text-slate-800">{c.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{c.description || "—"}</td>
                <td className="px-5 py-3 tabular-nums text-slate-600">{c.dishes} món</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                    {c.isActive ? "Còn Hàng" : "○ Hết Hàng"}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"><Pencil size={13} /> Sửa</button>
                  <span className="mx-2 text-slate-300">·</span>
                  <button onClick={() => setDeleting(c)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600"><Trash2 size={13} /> Xoá</button>
                </td>
              </tr>
            ))}
            {loading && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">Đang tấi...</td></tr>
            )}
            {!loading && items.length === 0 && !error && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">Chưa có danh mục nào.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Phân trang: Previous / trang hiện tại / Next (giống Tables) */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          title="Trang trước"
        >
          ‹
        </button>
        <span className="min-w-[80px] text-center text-sm font-bold text-slate-700">
          Trang {page}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          title="Trang sau"
        >
          ›
        </button>
      </div>

      {showForm && (
        <Modal title={editing ? "Sửa danh mục" : "Thêm danh mục"} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Tên danh mục">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Món nướng" autoFocus />
            </Field>
            <Field label="Mô Tả">
              <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô Tả ngắn danh mục" />
            </Field>
            <Field label="Ảnh (tuỳ chọn)">
              <input type="file" accept="image/*" className={inputClass} onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-violet-500" />
              Kích hoạt (danh mục hiển hi)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Huỷ</button>
              <button type="submit" disabled={busy} className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90">
                {busy ? "Đang lưu..." : (editing ? "Lưu thay đổi" : "Thêm mới")}
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
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}