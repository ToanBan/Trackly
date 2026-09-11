import { api, BASE_URL } from "./client"

export interface Category {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  userId: number
}

export function resolveImageUrl(path: string | null): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  const origin = BASE_ORIGIN
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`
}

const BASE_ORIGIN = (BASE_URL ?? "http://localhost:5289/api").replace(/\/api\/?$/, "")

export async function listCategories(limit = 10, page = 1): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/categories", { params: { limit, page } })
  return data
}

export async function createCategory(form: {
  name: string
  description: string
  image?: File | null
}): Promise<Category> {
  const fd = new FormData()
  fd.append("name", form.name)
  fd.append("description", form.description)
  if (form.image) fd.append("imageUrl", form.image)
  const { data } = await api.post<Category>("/categories", fd)
  return data
}

export async function updateCategory(
  id: number,
  form: { name?: string; description?: string; isActive?: boolean },
): Promise<Category> {
  const { data } = await api.put<Category>(`/categories/${id}`, {
    name: form.name,
    description: form.description,
    isActive: form.isActive,
  })
  return data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`)
}