import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDish, resolveImageUrl, type Dish } from "@/api/dishes";
import { useCart } from "@/context/CartContext";

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function DishDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, totalItems } = useCart();

  const handleAddToCart = () => {
    if (!dish || !dish.isAvailable) return;
    addItem(dish, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDish(Number(id))
      .then((d) => {
        if (!cancelled) {
          setDish(d);
          setQuantity(1);
        }
      })
      .catch(() => {
        if (!cancelled)
          setError("Không tìm thấy món ăn hoặc có lỗi xảy ra. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, loadKey]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-cyan-300 hover:text-slate-900"
        >
          ← Quay lại thực đơn
        </button>

        {loading && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-3xl border border-violet-100 bg-white/90 p-10 text-center shadow-sm">
            <p className="text-5xl">😕</p>
            <h1 className="mt-4 text-xl font-bold text-slate-900">Ôi!</h1>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                onClick={() => setLoadKey((k) => k + 1)}
                className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600"
              >
                Thử lại
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Về thực đơn
              </Button>
            </div>
          </div>
        )}
        {!loading && !error && dish && (
          <div className="overflow-hidden rounded-[32px] border border-violet-100 bg-white/95 shadow-[0_30px_60px_rgba(167,139,250,0.12)]">
            <div className="grid gap-0 md:grid-cols-2">
              <div className="overflow-hidden bg-slate-200">
                {dish.imageUrl ? (
                  <img
                    src={resolveImageUrl(dish.imageUrl) ?? ""}
                    alt={dish.name}
                    className="h-72 w-full object-cover md:h-full"
                  />
                ) : (
                  <div className="flex h-72 w-full items-center justify-center text-slate-400 md:h-full">
                    Không có ảnh
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-10">
                {dish.categories?.name && (
                  <Badge className="mb-4 w-fit rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                    {dish.categories.name}
                  </Badge>
                )}
                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  {dish.name}
                </h1>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-cyan-600">
                    {formatPrice(dish.price)}
                  </span>
                </div>

                <div className="mt-3">
                  {dish.isAvailable ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Còn phục vụ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Tạm hết
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Mô tả
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {dish.description || "Chưa có mô tả cho món ăn này."}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Số lượng
                    </span>
                    <div className="flex items-center rounded-full border border-slate-200 bg-white">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.max(1, q - 1))
                        }
                        disabled={!dish.isAvailable}
                        className="flex h-10 w-10 items-center justify-center rounded-l-full text-lg font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>
                      <input
                        inputMode="numeric"
                        min={1}
                        value={quantity}
                        disabled={!dish.isAvailable}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setQuantity(Number.isFinite(v) && v > 0 ? v : 1);
                        }}
                        className="h-10 w-12 border-0 bg-transparent text-center text-base font-bold text-slate-900 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        disabled={!dish.isAvailable}
                        className="flex h-10 w-10 items-center justify-center rounded-r-full text-lg font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Tạm tính
                    </p>
                    <p className="text-lg font-black text-cyan-600">
                      {formatPrice(dish.price * quantity)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!dish.isAvailable}
                    className="mt-6 h-14 flex-1 rounded-2xl bg-cyan-500 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-600"
                  >
                    Đặt món ({quantity})
                  </Button>
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    aria-label="Xem giỏ hàng"
                    className="relative mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600"
                  >
                    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    {totalItems > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </div>

                {added && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <p className="text-sm font-semibold text-emerald-700">
                      ✓ Đã thêm {quantity} {dish.name} vào giỏ
                    </p>
                    <button
                      onClick={() => navigate("/cart")}
                      className="shrink-0 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                    >
                      Xem giỏ ({totalItems})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-400">
          Trackly · Tìm món ngon mỗi ngày
        </div>
      </div>
    </div>
  );
}
