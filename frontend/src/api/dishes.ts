import { api, BASE_URL } from "./client"

export interface DishCategoryRef {
  id: number
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
}

export interface Dish {
  id: number
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isAvailable: boolean
  categoryId: number
  createdAt: string
  userId: number
  categories: DishCategoryRef | null
}

/** Converteix el camí relatiu de la imatge a URL completa (fitxers estàtics del backend). */
export function resolveImageUrl(path: string | null): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  const origin = (BASE_URL ?? "http://localhost:5289/api").replace(/\/api\/?$/, "")
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`
}


export async function getDish(id: number): Promise<Dish> {
  const { data } = await api.get<Dish>(`/dishes/${id}`)
  return data
}

export async function listDishes(limit = 20, page = 1): Promise<Dish[]> {
  const { data } = await api.get<Dish[]>("/dishes", { params: { limit, page } })
  return data
}

/** Crear dish. S'envia com FormData per permetre pujar una imatge. */
export async function createDish(form: {
  name: string
  categoryId: number
  description?: string
  price: number
  image?: File | null
}): Promise<Dish> {
  const fd = new FormData()
  fd.append("name", form.name)
  fd.append("categoryId", String(form.categoryId))
  fd.append("description", form.description ?? "")
  fd.append("price", String(form.price))
  if (form.image) fd.append("imageUrl", form.image)
  const { data } = await api.post<Dish>("/dishes", fd)
  return data
}

/** Actualitzar dish. El backend espera FormData (pot incloure nova imatge). */
export async function updateDish(
  id: number,
  form: { name?: string; categoryId?: number; description?: string; price?: number; isAvailable?: boolean; image?: File | null },
): Promise<Dish> {
  const fd = new FormData()
  if (form.name !== undefined) fd.append("name", form.name)
  if (form.categoryId !== undefined) fd.append("categoryId", String(form.categoryId))
  if (form.description !== undefined) fd.append("description", form.description)
  if (form.price !== undefined) fd.append("price", String(form.price))
  if (form.isAvailable !== undefined) fd.append("isAvailable", String(form.isAvailable))
  if (form.image) fd.append("imageUrl", form.image)
  const { data } = await api.put<Dish>(`/dishes/${id}`, fd)
  return data
}

export async function deleteDish(id: number): Promise<void> {
  await api.delete(`/dishes/${id}`)
}