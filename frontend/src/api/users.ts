import { api } from "./client";

export type UserRole = "staff" | "user";

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  phoneNumber: string | null;
  roles: string[];
}

export interface CustomerLoyalty {
  id: number;
  username: string;
  email: string;
  phoneNumber: string | null;
  points: number;
}

export interface UserListResponse {
  items: (UserSummary | CustomerLoyalty)[];
  total?: number;
  page?: number;
  limit?: number;
}

/** Danh sách người dùng theo role — role=user trả kèm điểm Loyalty. */
export async function getUsers(
  role: UserRole,
  page = 1,
  limit = 10,
): Promise<UserListResponse> {
  const { data } = await api.get<UserListResponse>("/users", {
    params: { role, page, limit },
  });
  return data;
}

/** Thay toàn bộ mảng roles của user (cấp/quy/thu hồi quyền nhân viên). */
export async function setUserRoles(
  id: number,
  roles: string[],
): Promise<UserSummary> {
  const { data } = await api.put<UserSummary>(`/users/${id}/roles`, { roles });
  return data;
}