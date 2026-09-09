import { api } from "./client"

export interface Table {
  id: number
  tableNumber: string
  slug: string
  status: string
  qrCodeUrl: string
  createdAt: string
}

export interface TableSession {
  tableToken: string
}

/**
 * Tạo bàn mới (dashboard). Backend sinh slug + mã QR,
 * QR trỏ tới `{origin}?table={slug}`.
 */
export async function createTable(tableNumber: string): Promise<Table> {
  const { data } = await api.post<Table>("/table/generate-qr", null, {
    params: { tableNumber },
  })
  return data
}

/**
 * Lấy session cho bàn khi khách quét QR (`?table={slug}`).
 * Backend tự set cookie HttpOnly `tableToken` — frontend không cần
 * lưu token, các request sau sẽ tự động gửi kèm cookie.
 */
export async function getTableSession(slug: string): Promise<TableSession> {
  const { data } = await api.get<TableSession>(
    `/table/${encodeURIComponent(slug)}/table-session/me`,
  )
  return data
}

/**
 * Lấy danh sách bàn có phân trang (offset/limit, limit mặc định 10).
 */
export async function getTables(page = 1, limit = 10): Promise<Table[]> {
  const { data } = await api.get<Table[]>("/table", {
    params: { page, limit },
  })
  return data
}

/**
 * Xoá bàn (kèm ảnh QR trên đĩa ở backend).
 */
export async function deleteTable(id: number): Promise<void> {
  await api.delete(`/table/${id}`)
}

/**
 * Cập nhât bàn (backend xoá ảnh QR cũ khi có ảnh mới).
 * Body phải chứa các trường required của backend model Tables.
 */
export async function updateTable(
  id: number,
  payload: Partial<Table> & { tableNumber: string },
): Promise<Table> {
  const { data } = await api.put<Table>(`/table/${id}`, payload)
  return data
}