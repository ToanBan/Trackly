import * as signalR from "@microsoft/signalr";
import type { OrderItemResponse, OrderResponse } from "./orders";

/**
 * Kết nối SignalR tới hub bếp.
 * - URL tương đối "/hubs/kitchen": đi qua Vite proxy ở dev (cùng origin,
 *   cookie HttpOnly tự gửi — không lo CORS).
 * - withAutomaticReconnect: tự reconnect khi đứt mạng (schema mốc thời gian tuỳ chọn).
 */
export function createKitchenConnection(): signalR.HubConnection {
  return new signalR.HubConnectionBuilder()
    .withUrl("/hubs/kitchen", { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();
}

/* ── Types cho UI bếp (giữ nguyên shape cũ của Kitchen.tsx) ── */

export type KitchenOrderStatus = "waiting" | "cooking" | "done";

export interface KitchenOrderItem {
  name: string;
  qty: number;
  note?: string;
}

export interface KitchenOrder {
  id: number;
  table: string;
  placedAt: number; // epoch ms — đồng hồ đếm giờ UI dùng
  status: KitchenOrderStatus;
  items: KitchenOrderItem[];
}

/** Map status backend -> status UI bếp. */
function mapStatus(status: string): KitchenOrderStatus {
  switch (status) {
    case "Preparing":
      return "cooking";
    case "Served":
    case "Completed":
      return "done";
    // Pending, Cancelled, ... -> chờ làm
    default:
      return "waiting";
  }
}

/** OrderResponse (backend) -> KitchenOrder (UI). */
export function mapOrder(o: OrderResponse): KitchenOrder {
  return {
    id: o.id,
    table: `Bàn ${o.tableId}`,
    placedAt: new Date(o.createdAt).getTime(),
    status: mapStatus(o.status),
    items: (o.items ?? []).map(
      (it: OrderItemResponse): KitchenOrderItem => ({
        name: it.dishName,
        qty: it.quantity,
        // Backend chưa có field note — UI ẩn ghi chú cho tới khi thêm.
      }),
    ),
  };
}