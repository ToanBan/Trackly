import { api } from "./client";

export interface LoyaltyHistoryEntry {
  id: number;
  type: "earn" | "redeem";
  points: number;
  description: string;
  billId: number | null;
  createdAt: string;
}

export interface LoyaltyResponse {
  points: number;
  history: LoyaltyHistoryEntry[];
}

/** Lấy điểm + lịch sử điểm của khách đang đăng nhập (GET /loyalty/me). */
export async function getMyLoyalty(): Promise<LoyaltyResponse> {
  const { data } = await api.get<LoyaltyResponse>("/loyalty/me");
  return data;
}

/** Lấy số điểm của một user cụ thể (dashboard khi xem hoá đơn). */
export async function getUserPoints(userId: number): Promise<number> {
  const { data } = await api.get<{ userId: number; points: number }>(`/loyalty/by-user/${userId}`);
  return data.points;
}