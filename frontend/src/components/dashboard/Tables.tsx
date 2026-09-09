import { useEffect, useState, type FormEvent } from "react"
import { createTable, deleteTable, getTables, updateTable, type Table as ApiTable } from "@/api/table"
import { Plus, Pencil, Trash2, Download, QrCode, Armchair } from "lucide-react"
import type { Table } from "./types"
import { SectionTitle, ActionButton, Modal, ConfirmDialog, inputClass } from "./sharedUI"
export default function Tables() {
  const [items, setItems] = useState<Table[]>([])
  const [editing, setEditing] = useState<Table | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<Table | null>(null)
  const [detail, setDetail] = useState<Table | null>(null)
  const [form, setForm] = useState({ name: "", seats: 4 })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addError, setAddError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  // Backend Tables không có cột "seats" → chốt 4 khi map từ API.
  const mapApiTable = (t: ApiTable): Table => ({
    id: t.id,
    name: t.tableNumber,
    seats: 4,
    occupied: t.status !== "available",
    qr: t.qrCodeUrl,
    slug: t.slug,
  })

  // Origin của backend phục vụ ảnh QR (cùng cổng với API).
  const QR_ORIGIN = "http://localhost:5289"

  const qrFullUrl = (t: Table) => (t.slug ? `${QR_ORIGIN}${t.qr}` : t.qr)

  const downloadQr = async (t: Table) => {
    if (!t.slug) return
    const url = qrFullUrl(t)

    // Ảnh ở cross-origin nên `download` của <a> bị bỏ qua → phải fetch blob rồi tạo object URL.
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = objectUrl
      a.download = `${t.slug}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()

      URL.revokeObjectURL(objectUrl)
    } catch {
      // fallback: mở ảnh trực tiếp nếu không fetch được
      window.open(url, "_blank")
    }
  }

  // Tải danh sách bàn từ backend pe paginat (limit PAGE_SIZE).
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void (async () => {
      try {
        const tables = await getTables(page, PAGE_SIZE)
        if (!cancelled) setItems(tables.map(mapApiTable))
      } catch {
        // giữ rỗng nếu backend chưa disponible
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const openAdd = () => { setEditing(null); setForm({ name: "", seats: 4 }); setAddError(null); setShowForm(true) }
  const openEdit = (t: Table) => { setEditing(t); setForm({ name: t.name, seats: 4 }); setAddError(null); setShowForm(true) }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || submitting) return

    setSubmitting(true)
    setAddError(null)
    try {
      if (editing) {
        // Cập đổi tên bàn; backend giữ ảnh QR cũ (ảnh không đổi).
        const updated = await updateTable(editing.id, {
          id: editing.id,
          tableNumber: form.name.trim(),
          slug: editing.slug ?? "",
          status: editing.occupied ? "occupied" : "available",
          qrCodeUrl: editing.qr,
        })
        setItems(items.map((t2) => (t2.id === editing.id ? mapApiTable(updated) : t2)))
      } else {
        // Thêm bàn thật: backend sinh slug + mã QR.
        const created = await createTable(form.name.trim())
        setItems([...items, mapApiTable(created)])
      }
    } catch {
      setAddError("Không thể lưu bàn. Vui lòng thử lại.")
      setSubmitting(false)
      return
    } finally {
      setSubmitting(false)
    }
    setShowForm(false)
  }

  const confirmDelete = async (t: Table) => {
    setDeleting(null)
    try {
      await deleteTable(t.id)
      setItems((prev) => prev.filter((x) => x.id !== t.id))
    } catch {
      // bàn không bị xoá; giữ nguyên list
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <SectionTitle title="Bàn ăn" subtitle="Quản lý bàn & mã QR để khách quét vào gọi món" />
      <ActionButton label="Thêm bàn" icon={<Plus size={16} />} onClick={openAdd} />

      {loading ? (
        <div className="flex-1"><p className="text-sm text-slate-500">Đang tải danh sách bàn...</p></div>
      ) : (
        <section className="grid flex-1 content-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((t) => (
          <div key={t.id} onClick={() => setDetail(t)} className="cursor-pointer rounded-2xl border border-violet-100 bg-white/95 p-4 shadow-[0_16px_35px_rgba(167,139,250,0.08)] transition hover:border-violet-300 hover:shadow-[0_16px_35px_rgba(167,139,250,0.15)]">
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
              {t.slug ? (
                <img src={qrFullUrl(t)} alt={`QR ${t.name}`} className="h-14 w-14 shrink-0 rounded-md bg-white p-1 shadow-sm" />
              ) : (
                <div className="grid h-14 w-14 shrink-0 grid-cols-4 grid-rows-4 gap-px rounded-md bg-white p-1 shadow-sm">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className={(i * 7 + t.id * 3) % 3 === 0 ? "bg-slate-900" : "bg-transparent"} />
                  ))}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"><QrCode size={12} /> Mã QR bàn</p>
                <p className="truncate font-mono text-xs font-bold text-slate-800">
                  {t.slug ? `${window.location.origin}?table=${t.slug}` : t.qr}
                </p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); downloadQr(t) }} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"><Download size={13} /> Tải</button>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); openEdit(t) }} className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-slate-200 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"><Pencil size={13} /> Sửa</button>
              <button onClick={(e) => { e.stopPropagation(); setDeleting(t) }} className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-red-100 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-50"><Trash2 size={13} /> Xoá</button>
            </div>
          </div>
        ))}
          {items.length === 0 && (
            <p className="text-sm text-slate-500">Chưa có bàn. Bấm "Thêm bàn" để tạo bàn thật với mã QR.</p>
          )}
        </section>
      )}

      {/* Phân trang: Previous / số trang hiện tại / Next */}
      <div className="mt-auto flex items-center justify-center gap-3">
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
        <Modal title={editing ? "Sửa bàn" : "Thêm bàn"} onClose={() => setShowForm(false)}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Tên bàn">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Bàn 15" autoFocus />
            </Field>
            <Field label="Số chỗ ngồi">
              <input type="number" min={1} disabled readOnly className={inputClass} value={4} />
            </Field>
            {!editing && (
              <p className="text-[11px] font-medium text-slate-400">Số chỗ ngồi cố định 4 — backend chưa lưu cột này.</p>
            )}
            {addError && (
              <p className="text-xs font-semibold text-red-500">{addError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Huỷ</button>
              <button type="submit" disabled={submitting} className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90 disabled:opacity-60">
                {submitting ? "Đang thêm..." : editing ? "Lưu thay đổi" : "Thêm mới"}
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
          onConfirm={() => confirmDelete(deleting)}
        />
      )}

      {detail && (
        <Modal title={`Chi tiết bàn: ${detail.name}`} onClose={() => setDetail(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500 ${detail.occupied ? "bg-violet-100" : "bg-emerald-100"}`}><Armchair size={22} /></div>
              <div>
                <p className="text-base font-black text-slate-900">{detail.name}</p>
                <p className="text-xs text-slate-500">{detail.seats} chỗ ngồi</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-500">Trạng thái</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${detail.occupied ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {detail.occupied ? "Có khách" : "Trống"}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-500">Số chỗ ngồi</p>
                <p className="mt-1 font-bold text-slate-800">{detail.seats}</p>
              </div>
              <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold text-slate-500">Đường dẫn quét QR</p>
                <p className="mt-1 truncate font-mono text-xs font-bold text-slate-700">
                  {detail.slug ? `${window.location.origin}?table=${detail.slug}` : detail.qr}
                </p>
              </div>
            </div>

            {detail.slug && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"><QrCode size={12} /> Mã QR bàn</p>
                <img src={qrFullUrl(detail)} alt={`QR ${detail.name}`} className="h-40 w-40 rounded-md bg-white p-2 shadow-sm" />
                <button
                  onClick={() => downloadQr(detail)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-violet-200 transition hover:opacity-90"
                >
                  <Download size={16} /> Tải ảnh QR
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
