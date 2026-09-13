import { api } from "./client";

export interface OrderItemPayload {
  dishId: number;
  quantity: number;
}

export interface OrderItemResponse {
  id: number;
  dishId: number;
  dishName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderResponse {
  id: number;
  tableId: number;
  userId: number | null;
  billId: number | null;
  status: string;
  subtotal: number;
  createdAt: string;
  items: OrderItemResponse[];
}

interface CreateOrderResponse {
  message: string;
  order: OrderResponse;
}

/**
 * Gửi đơn hàng lên backend.
 * Bàn được backend xác định qua cookie `tableToken` (đặt khi khách quét QR),
 * nên không cần gửi tableSlug — axios đã `withCredentials` tự động gửi cookie.
 * `useLoyaltyPoints` mặc định false: điểm chỉ dùng lúc THANH TOÁN bill
 * (POST /bills/{id}/pay), không phải lúc đặt món.
 */
export async function createOrder(
  items: OrderItemPayload[],
  useLoyaltyPoints = false,
): Promise<OrderResponse> {
  const { data } = await api.post<CreateOrderResponse>("/orders", {
    items,
    useLoyaltyPoints,
  });
  return data.order;
}

export type OrderStatus = "Pending" | "Preparing" | "Served" | "Cancelled";

/** Danh sách đơn (trang bếp) — yêu cầu đăng nhập. */
export async function getOrders(page = 1, limit = 50): Promise<OrderResponse[]> {
  const { data } = await api.get<{ items: OrderResponse[] }>("/orders", {
    params: { page, limit },
  });
  return data.items;
}

export interface OrderListResponse {
  items: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}

/** Danh sách đơn kèm tổng số cho phân trang (dashboard). */
export async function getOrdersPage(page = 1, limit = 10): Promise<OrderListResponse> {
  const { data } = await api.get<OrderListResponse>("/orders", {
    params: { page, limit },
  });
  return data;
}

/** Chi tiết một đơn hàng (kèm order items). */
export async function getOrder(id: number): Promise<OrderResponse> {
  const { data } = await api.get<OrderResponse>(`/orders/${id}`);
  return data;
}

/** Cập nhật trạng thái đơn (Kitchen: HOÀN THÀNH / Mở lại). */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<OrderResponse> {
  const { data } = await api.put<OrderResponse>(`/orders/${id}/status`, {
    status,
  });
  return data;
}