import { api } from "./client";
import type { OrderResponse } from "./orders";

export interface Bill {
  id: number;
  tableId: number;
  userId: number | null;
  status: "Open" | "Paid" | "Cancelled";
  subtotal: number;
  discountAmount: number;
  loyaltyPointsUsed: number;
  total: number;
  loyaltyPointsEarned: number;
  createdAt: string;
  paidAt: string | null;
  orders: OrderResponse[];
}

export interface BillListResponse {
  items: Bill[];
  total: number;
  page: number;
  limit: number;
}

/** Danh sách hoá đơn (dashboard) — yêu cầu đăng nhập. */
export async function getBills(page = 1, limit = 10): Promise<BillListResponse> {
  const { data } = await api.get<BillListResponse>("/bills", {
    params: { page, limit },
  });
  return data;
}

export async function getBill(id: number): Promise<Bill> {
  const { data } = await api.get<Bill>(`/bills/${id}`);
  return data;
}

export interface PayBillResult {
  message: string;
  bill: Bill;
  pointsEarned: number;
}

/**
 * Thanh toán hoá đơn.
 * Khi `useLoyaltyPoints = true`, khách (có userId) dùng 400 điểm để giảm 10%.
 */
export async function payBill(
  id: number,
  useLoyaltyPoints = false,
): Promise<PayBillResult> {
  const { data } = await api.post<PayBillResult>(`/bills/${id}/pay`, {
    useLoyaltyPoints,
  });
  return data;
}