import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { listDishes, resolveImageUrl, type Dish } from "@/api/dishes";
import { listCategories, type Category } from "@/api/categories";

const quickTags = ["Đồ uống", "Món nướng", "Món tráng miệng", "Healthy"];

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function Home() {
  const navigate = useNavigate();
  const [link, setLink] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const { user, logout } = useAuth();
  const { addItem, totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  const showToast = (text: string) => {
    const id = Date.now();
    setToast({ id, text });
    window.setTimeout(() => {
      setToast((cur) => (cur && cur.id === id ? null : cur));
    }, 2200);
  };

  const handleAddDish = (dish: Dish) => {
    if (!dish.isAvailable) return;
    addItem(dish, 1);
    showToast(`Đã thêm "${dish.name}" vào giỏ`);
  };

  const [cats, setCats] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([listCategories(100, 1), listDishes(100, 1)])
      .then(([c, d]) => {
        if (cancelled) return;
        setCats(c);
        setDishes(d);
      })
      .catch(() => {
        if (!cancelled) setError("Không thể tải thực đơn. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Gom món còn phục vụ theo category
  const available = dishes.filter((d) => d.isAvailable);
  const groups: Record<number, Dish[]> = {};
  available.forEach((d) => {
    (groups[d.categoryId] ??= []).push(d);
  });

  // Chỉ hiển thị category đang bật và có món
  const activeCats = cats.filter(
    (c) => c.isActive && (groups[c.id]?.length ?? 0) > 0,
  );

  const featured = available[0] ?? null;
  const primaryActive =
    activeCategory || (activeCats[0] ? String(activeCats[0].id) : "");

  const displayStats = [
    { label: "Món trong thực đơn", value: String(dishes.length) },
    { label: "Danh mục món", value: String(activeCats.length) },
    { label: "Món còn phục vụ", value: String(available.length) },
  ];

  const handleSearch = () => {
    console.log("Tìm món:", link);
  };

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    document
      .getElementById(`category-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] px-4">
        <div className="w-full max-w-xl rounded-3xl border border-violet-100 bg-white/90 p-10 text-center shadow-sm">
          <p className="text-5xl">😕</p>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Ôi!</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Button
            onClick={() => setLoadKey((k) => k + 1)}
            className="mt-6 rounded-full bg-cyan-500 text-white hover:bg-cyan-600"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative z-40 mb-8 flex items-center justify-between rounded-full border border-violet-100 bg-white/85 px-4 py-3 shadow-[0_10px_30px_rgba(167,139,250,0.08)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white">
              T
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                Trackly
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            {activeCats.map((c) => (
              <a
                key={c.id}
                href={`#category-${c.id}`}
                className={
                  primaryActive === String(c.id)
                    ? "font-semibold text-cyan-600"
                    : "transition hover:text-slate-900"
                }
              >
                {c.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/cart")}
              aria-label="Xem giỏ hàng"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white transition hover:opacity-90"
              >
                {user.username.charAt(0)}
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-xl"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
                  >
                    Hồ sơ
                  </button>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                      navigate("/login");
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
            >
              Đăng nhập
            </Button>
          )}
          </div>
        </header>

        <main className="space-y-10">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[32px] border border-violet-100 bg-[radial-gradient(circle_at_top_left,_rgba(196,181,253,0.38),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.26),transparent_32%),linear-gradient(135deg,#f5f3ff_0%,#eff6ff_35%,#fefefe_100%)] p-6 shadow-[0_30px_60px_rgba(167,139,250,0.12)] sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,116,144,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,116,144,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <Badge className="mb-4 inline-flex rounded-full border border-cyan-300 bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
                  Thực đơn theo category
                </Badge>
                <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Khám phá món ăn <span className="text-cyan-600">ngon</span>{" "}
                  mỗi ngày
                </h1>
                <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
                  Duyệt danh sách món ăn theo từng category, so sánh giá và đặt
                  món chỉ trong vài giây.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {quickTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700 shadow-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
                  <Input
                    placeholder="Tìm tên món ăn hoặc loại món..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="h-14 rounded-2xl border-slate-200 bg-white text-base text-slate-900 placeholder:text-slate-400"
                  />
                  <Button
                    onClick={handleSearch}
                    className="h-14 rounded-2xl bg-cyan-500 px-6 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-600"
                  >
                    Tìm món
                  </Button>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {displayStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-violet-100 bg-white/90 p-3 shadow-[0_8px_24px_rgba(167,139,250,0.08)]"
                    >
                      <p className="text-2xl font-bold text-slate-900">
                        {item.value}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {featured && (
                <div className="hidden rounded-[28px] border border-violet-100 bg-white/95 p-4 shadow-[0_20px_50px_rgba(167,139,250,0.12)] backdrop-blur-xl lg:block">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Món nổi bật</p>
                      <p className="text-lg font-bold text-slate-900">
                        {featured.name}
                      </p>
                    </div>
                    <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
                      ⭐ Nổi bật
                    </Badge>
                  </div>
                  <div className="overflow-hidden rounded-2xl bg-slate-200">
                    {featured.imageUrl ? (
                      <img
                        src={resolveImageUrl(featured.imageUrl) ?? ""}
                        alt={featured.name}
                        className="h-52 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-52 w-full items-center justify-center text-slate-400">
                        Không có ảnh
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Giá</span>
                      <span className="font-semibold text-cyan-600">
                        {formatPrice(featured.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Category</span>
                      <span className="font-semibold text-slate-700">
                        {featured.categories?.name ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Trạng thái</span>
                      <span className="font-semibold text-emerald-600">
                        Còn phục vụ
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
          {/* Category nav - sticky */}
          <div className="sticky top-4 z-20 -mx-1 flex gap-2 overflow-x-auto rounded-3xl border border-violet-100 bg-white/85 px-3 py-3 shadow-[0_10px_30px_rgba(167,139,250,0.1)] backdrop-blur-sm">
            {activeCats.map((c) => (
              <button
                key={c.id}
                onClick={() => scrollToCategory(String(c.id))}
                className={
                  primaryActive === String(c.id)
                    ? "flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                    : "flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                }
              >
                {c.name}
                <span
                  className={
                    primaryActive === String(c.id)
                      ? "ml-1 rounded-full bg-white/20 px-1.5 text-xs"
                      : "ml-1 rounded-full bg-slate-100 px-1.5 text-xs text-slate-500"
                  }
                >
                  {groups[c.id]?.length ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Sections theo category */}
          {activeCats.map((category) => (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="mx-auto max-w-6xl scroll-mt-24 px-1"
            >
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-600">
                    {category.name}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {category.description || `Món thuộc danh mục ${category.name}`}
                  </h2>
                </div>
                <span className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 sm:inline-flex">
                  {groups[category.id]?.length ?? 0} món
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {(groups[category.id] ?? []).map((dish) => (
                  <Card
                    key={dish.id}
                    className="group flex cursor-pointer flex-col overflow-hidden border border-violet-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_18px_40px_rgba(167,139,250,0.15)]"
                    onClick={() => navigate(`/dish/${dish.id}`)}
                  >
                    <div className="relative">
                      {dish.imageUrl ? (
                        <img
                          src={resolveImageUrl(dish.imageUrl) ?? ""}
                          alt={dish.name}
                          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-52 w-full items-center justify-center bg-slate-100 text-slate-400">
                          Không có ảnh
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
                        {dish.categories?.name ?? "Món"}
                      </span>
                    </div>
                    <CardContent className="flex flex-1 flex-col space-y-2 p-4">
                      <p className="line-clamp-1 text-base font-bold leading-5 text-slate-900">
                        {dish.name}
                      </p>
                      <p className="line-clamp-2 min-h-[34px] flex-1 text-sm leading-5 text-slate-500">
                        {dish.description || "Chưa có mô tả."}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-emerald-600">
                        {dish.isAvailable ? "● Còn phục vụ" : "● Tạm hết"}
                      </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-cyan-600">
                            {formatPrice(dish.price)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddDish(dish);
                        }}
                        className="w-full rounded-xl bg-slate-100 text-sm text-slate-800 hover:bg-cyan-500 hover:text-white"
                      >
                        Đặt món
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}

{/* Banner khuyến mãi */}
          <section className="mx-auto max-w-6xl rounded-[28px] border border-violet-100 bg-[linear-gradient(120deg,#0ea5e9_0%,#6366f1_60%,#8b5cf6_100%)] p-8 text-center text-white shadow-[0_20px_50px_rgba(99,102,241,0.3)]">
            <p className="text-sm uppercase tracking-[0.22em] text-white/80">
              Khuyến mãi hôm nay
            </p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">
              Đặt món sớm - Giảm thêm 20%
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-white/85">
              Nhập mã <span className="font-bold">TRACKLY20</span> khi thanh
              toán ngay trong hôm nay, kẻo hết!
            </p>
            <Button
              onClick={() => navigate("/")}
              className="mt-6 rounded-full bg-white text-cyan-700 hover:bg-white/90"
            >
              Nhận mã ngay
            </Button>
          </section>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-xl">
            <span>✓</span>
            <span>{toast.text}</span>
            <button
              onClick={() => navigate("/cart")}
              className="ml-2 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Xem giỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
