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