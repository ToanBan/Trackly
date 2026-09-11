import { useState, useEffect, type FormEvent } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Category, Dish } from "./types"
import { SectionTitle, ActionButton, Modal, ConfirmDialog, Field, inputClass, formatPrice } from "./sharedUI"
import { listDishes, createDish, updateDish, deleteDish, resolveImageUrl } from "../../api/dishes"
import { listCategories } from "../../api/categories"

export default function Dishes() {
  const [items, setItems] = useState<Dish[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Dish | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Dish | null>(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: "", categoryId: 0, description: "", price: 0, available: true })
  const [image, setImage] = useState<File | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  async function refresh(cancelled = false) {
    const catList = await listCategories(100, 1)
    const dishList = await listDishes(PAGE_SIZE, page)
    if (cancelled) return
    setCats(
      catList.map((c) => ({
        ...c,
        dishes: dishList.filter((d) => d.categoryId === c.id).length,
      })),
    )
    setItems(dishList.map((d) => ({
      ...d,
      categoryName: d.categories?.name ?? catList.find((c) => c.id === d.categoryId)?.name ?? "Không danh mục",
    })))
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
    setForm({ name: "", categoryId: cats[0]?.id ?? 0, description: "", price: 0, available: true })
    setImage(null)
    setShowForm(true)
  }
  const openEdit = (d: Dish) => {
    setEditing(d)
    setForm({ name: d.name, categoryId: d.categoryId, description: d.description ?? "", price: d.price, available: d.isAvailable })
    setImage(null)
    setShowForm(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || form.categoryId <= 0) return
    setBusy(true)
    try {
      if (editing) {
        await updateDish(editing.id, {
          name: form.name.trim(),
          categoryId: form.categoryId,
          description: form.description,
          price: form.price,
          isAvailable: form.available,
          image,
        })
      } else {
        await createDish({
          name: form.name.trim(),
          categoryId: form.categoryId,
          description: form.description,
          price: form.price,
          image,
        })
      }
      setShowForm(false)
      await refresh()
    } catch {
      setError("Không thể lưu món ăn")
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await deleteDish(deleting.id)
      setDeleting(null)
      await refresh()
    } catch {
      setError("Không nẹ thể xoá món ăn này.")
    } finally {
      setBusy(false)
    }
  }

  const img = (d: Dish) => resolveImageUrl(d.imageUrl)

  const toggleAvailable = async (d: Dish) => {
    setBusy(true)
    try {
      await updateDish(d.id, { isAvailable: !d.isAvailable })
      await refresh()
    } catch {
      setError("Không thể đổi trạng thái có/hết hàng")
    } finally {
      setBusy(false)
    }
  }
return (
    <div className="space-y-6">
      <SectionTitle title="Món ăn" subtitle="Danh sách món: ảnh, giá, trạng thái còn/hết hàng" />
      <ActionButton label="Thêm món ăn" icon={<Plus size={16} />} onClick={openAdd} />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

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
                    {img(d) && <img src={img(d)!} alt={d.name} className="h-10 w-10 rounded-lg object-cover" />}
                    <span className="font-bold text-slate-800">{d.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{d.categoryName}</td>
                <td className="px-5 py-3 font-bold tabular-nums text-slate-800">{formatPrice(d.price)}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleAvailable(d)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${d.isAvailable ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                    title="Đổi trạng thái có hàng"
                  >
                    {d.isAvailable ? "● Còn hàng" : "○ Hết hàng"}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openEdit(d)} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:text-cyan-700"><Pencil size={13} /> Sửa</button>
                  <span className="mx-2 text-slate-300">·</span>
                  <button onClick={() => setDeleting(d)} className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600"><Trash2 size={13} /> Xoá</button>
                </td>
              </tr>
            ))}
            {loading && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">Đang tấi...</td></tr>
            )}
            {!loading && items.length === 0 && !error && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">Chưa có món ăn nào.</td></tr>
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
        <Modal title={editing ? "Sửa món ăn" : "Thêm món ăn"} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Tên món">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Bánh flan" autoFocus />
            </Field>
            <Field label="Danh mục">
              <select className={inputClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Мяra (tuỳ chọn)">
              <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Мяra món ăn" />
            </Field>
            <Field label="Ảnh (tuỳ chọn)">
              <input type="file" accept="image/*" className={inputClass} onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
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
              <button type="submit" disabled={busy} className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90">
                {busy ? "Đang lưu..." : (editing ? "Lưu thay đổi" : "Thêm mới")}
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
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}