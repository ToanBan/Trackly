import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { resolveImageUrl } from "@/api/dishes";
import { createOrder, type OrderResponse } from "@/api/orders";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function Cart() {
  const navigate = useNavigate();
  const { items, totalItems, totalAmount, updateQuantity, removeItem, clear } =
    useCart();
  const { user } = useAuth();
  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (items.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const order = await createOrder(
        items.map((i) => ({ dishId: i.dish.id, quantity: i.quantity })),
      );
      clear();
      setPlacedOrder(order);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Không thể gửi đơn hàng. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] text-slate-800">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-cyan-300 hover:text-slate-900"
        >
          ← Quay lại thực đơn
        </button>

        <div className="overflow-hidden rounded-[32px] border border-violet-100 bg-white/95 shadow-[0_30px_60px_rgba(167,139,250,0.12)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <h1 className="text-2xl font-black text-slate-900">Giỏ hàng</h1>
            {user && (
              <p className="mt-1 text-sm text-slate-500">
                Bạn là khách hàng thân thiết — ưu đãi sẽ được áp dụng ở bước
                thanh toán.
              </p>
            )}
          </div>

          {placedOrder ? (
            <div className="px-6 py-16 text-center sm:px-10">
              <p className="text-6xl">🎉</p>
              <h2 className="mt-4 text-2xl font-black text-slate-900">
                Đặt món thành công!
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Mã đơn <span className="font-bold text-slate-700">#{placedOrder.id}</span>{" "}
                đã được gửi. Nhân viên sẽ nhanh chóng chuẩn bị món và phục vụ cho
                bạn ngay nhé.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={() => navigate("/")}
                  className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600"
                >
                  Tiếp tục gọi món
                </Button>
                <Button
                  onClick={() => {
                    setPlacedOrder(null);
                    navigate("/");
                  }}
                  variant="outline"
                  className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Về thực đơn
                </Button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-6xl">🛒</p>
              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Giỏ hàng đang trống
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Hãy thêm những món ngon bạn yêu thích vào giỏ nhé.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="mt-6 rounded-full bg-cyan-500 text-white hover:bg-cyan-600"
              >
                Xem thực đơn
              </Button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-slate-100 px-2 sm:px-4">
                {items.map((item) => {
                  const { dish, quantity } = item;
                  return (
                    <li
                      key={dish.id}
                      className="flex items-center gap-4 px-3 py-4"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-200">
                        {dish.imageUrl ? (
                          <img
                            src={resolveImageUrl(dish.imageUrl) ?? ""}
                            alt={dish.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            Không có ảnh
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {dish.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatPrice(dish.price)} / món
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-700">
                          {formatPrice(dish.price * quantity)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <div className="flex items-center rounded-full border border-slate-200">
                          <button
                            type="button"
                            aria-label="Giảm số lượng"
                            onClick={() => updateQuantity(dish.id, quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-l-full font-bold text-slate-700 transition hover:bg-slate-100"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Tăng số lượng"
                            onClick={() => updateQuantity(dish.id, quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-r-full font-bold text-slate-700 transition hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          aria-label={`Xoá ${dish.name}`}
                          onClick={() => removeItem(dish.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {totalItems} món trong giỏ
                    </p>
                    <p className="text-xs text-slate-400">
                      Tính tiền theo bàn khi thanh toán
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Tổng cộng
                    </p>
                    <p className="text-2xl font-black text-cyan-600">
                      {formatPrice(totalAmount)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => clear()}
                  className="mt-2 text-xs font-semibold text-slate-400 underline-offset-2 hover:text-red-500 hover:underline"
                >
                  Xoá toàn bộ giỏ
                </button>

                {error && (
                  <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
                    <p className="text-sm font-semibold text-rose-600">
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="mt-4 h-14 w-full rounded-2xl bg-cyan-500 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-600 disabled:opacity-60"
                >
                  {submitting
                    ? "Đang gửi đơn..."
                    : `Đặt hàng (${formatPrice(totalAmount)})`}
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-slate-400">
          Trackly · Tìm món ngon mỗi ngày
        </div>
      </div>
    </div>
  );
}