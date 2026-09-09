import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
const quickTags = ["Đồ uống", "Món nướng", "Món tráng miệng", "Healthy"];

const stats = [
  { label: "Món ăn đang theo dõi", value: "12.4K" },
  { label: "Món giảm giá hôm nay", value: "8.6%" },
  { label: "Calo kiểm soát được", value: "96.2%" },
];

/* Dữ liệu category & món ăn (tĩnh) */
type Dish = {
  name: string;
  description: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating: string;
  tag: string;
  kcal: number;
};

type Category = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  dishes: Dish[];
};

const categories: Category[] = [
  {
    id: "monchinh",
    name: "Món chính",
    emoji: "🍚",
    tagline: "Cơm, mì và các món ăn nhanh no bụng",
    dishes: [
      {
        name: "Cơm tấm sườn nướng",
        description: "Sườn nướng mật ong, cơm dẻo thơm, kèm bì chả",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Com+Tam",
        price: 45000,
        oldPrice: 55000,
        rating: "4.9",
        tag: "Bán chạy",
        kcal: 680,
      },
      {
        name: "Bánh mì thịt nướng",
        description: "Bánh mì giòn, thịt nướng than hoa, rau sống tươi",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Banh+Mi",
        price: 30000,
        rating: "4.8",
        tag: "Hot",
        kcal: 420,
      },
      {
        name: "Cơm gà xối mỡ",
        description: "Da gà giòn tan, xối mỡ nóng, nước chấm đậm đà",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Com+Ga",
        price: 52000,
        oldPrice: 60000,
        rating: "4.8",
        tag: "Mới",
        kcal: 720,
      },
    ],
  },
  {
    id: "phobun",
    name: "Phở & Bún",
    emoji: "🍜",
    tagline: "Món nước nóng hổi nghi ngút khói",
    dishes: [
      {
        name: "Phở bò đặc biệt",
        description: "Nước lèo trong ngọt, thịt bò mềm, bánh phở mịn",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Pho+Bo",
        price: 55000,
        oldPrice: 65000,
        rating: "4.9",
        tag: "Top 1",
        kcal: 460,
      },
      {
        name: "Bún bò Huế",
        description: "Sợi bún to, gia vị đậm đà, thêm giò heo hấp dẫn",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Bun+Bo",
        price: 60000,
        rating: "4.9",
        tag: "Bán chạy",
        kcal: 540,
      },
      {
        name: "Bún chả Hà Nội",
        description: "Chả nướng thơm lừng, nước chấm chua ngọt đặc trưng",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Bun+Cha",
        price: 48000,
        rating: "4.7",
        tag: "Hot",
        kcal: 500,
      },
    ],
  },
  {
    id: "monnuong",
    name: "Món nướng",
    emoji: "🍢",
    tagline: "Nóng lửa, béo ngậy, đậm đà",
    dishes: [
      {
        name: "Bò nướng lá lốt",
        description: "Bò cuốn lá lốt thơm nồng, chấm mắm nêm",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Bo+Nuong",
        price: 89000,
        oldPrice: 110000,
        rating: "4.8",
        tag: "Bán chạy",
        kcal: 590,
      },
      {
        name: "Heo rừng cuộn nướng",
        description: "Thịt heo rừng dai ngon, đậm vị nướng",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Heo+Nuong",
        price: 95000,
        rating: "4.9",
        tag: "Mới",
        kcal: 630,
      },
      {
        name: "Sò điệp nướng mỡ hành",
        description: "Sò tươi ngọt, mỡ hành nóng hổi béo ngậy",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=So+Diep",
        price: 75000,
        oldPrice: 90000,
        rating: "4.7",
        tag: "Hot",
        kcal: 380,
      },
    ],
  },
  {
    id: "douong",
    name: "Đồ uống",
    emoji: "🥤",
    tagline: "Cà phê, trà, sinh tố mát lạnh",
    dishes: [
      {
        name: "Cà phê sữa đá",
        description: "Cà phê rang xay đậm, sữa đặc béo ngậy",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Cafe+Dua",
        price: 25000,
        rating: "4.8",
        tag: "Bán chạy",
        kcal: 120,
      },
      {
        name: "Trà đào cam sả",
        description: "Trà kết hợp đào, cam tươi, mát lạnh sảng khoái",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Tra+Dao",
        price: 35000,
        oldPrice: 40000,
        rating: "4.9",
        tag: "Mới",
        kcal: 150,
      },
      {
        name: "Sinh tố bơ",
        description: "Bơ dầy mịn, sữa tươi, sữa đặc thơm lừng",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Sinh+To+Bo",
        price: 40000,
        rating: "4.9",
        tag: "Hot",
        kcal: 210,
      },
    ],
  },
  {
    id: "trangmieng",
    name: "Tráng miệng",
    emoji: "🍰",
    tagline: "Ngọt ngào khép lại bữa ăn trọn vẹn",
    dishes: [
      {
        name: "Chè khúc bạch",
        description: "Chè thanh mát, hạt bạch dai dai, thêm topping",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Che",
        price: 20000,
        rating: "4.8",
        tag: "Bán chạy",
        kcal: 180,
      },
      {
        name: "Bánh tráng nướng",
        description: "Giòn rụm, trứng, pate, phô mai ăn vặt",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Banh+Trang",
        price: 15000,
        oldPrice: 18000,
        rating: "4.7",
        tag: "Vặt",
        kcal: 260,
      },
      {
        name: "Bánh flan caramel",
        description: "Flan mềm mịn, caramel béo nhẹ ngọt",
        image: "https://placehold.co/700x520/e2e8f0/64748b?text=Flan",
        price: 18000,
        rating: "4.9",
        tag: "Mới",
        kcal: 160,
      },
    ],
  },
];

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}
export default function Home() {
  const navigate = useNavigate();
  const [link, setLink] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("monchinh");
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const handleSearch = () => {
    console.log("Tìm món:", link);
  };

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    document
      .getElementById(`category-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
            {categories.map((c) => (
              <a
                className={
                  activeCategory === c.id
                    ? "font-semibold text-cyan-600"
                    : "transition hover:text-slate-900"
                }
              >
                {c.name}
              </a>
            ))}
          </nav>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white transition hover:opacity-90"
              >
                {user.username.charAt(0)}
              </button>

              {menuOpen && (
                <div ref={menuRef} className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-slate-900">{user.username}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/profile") }}
                    className="flex w-full items-center px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
                  >
                    Hồ sơ
                  </button>
                  <button
                    onClick={async () => { setMenuOpen(false); await logout(); navigate("/login") }}
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
                  {stats.map((item) => (
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
              <div className="hidden rounded-[28px] border border-violet-100 bg-white/95 p-4 shadow-[0_20px_50px_rgba(167,139,250,0.12)] backdrop-blur-xl lg:block">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Món hot nhất</p>
                    <p className="text-lg font-bold text-slate-900">
                      Phở bò đặc biệt
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-600 hover:bg-red-100">
                    🔥 4.9
                  </Badge>
                </div>
                <div className="overflow-hidden rounded-2xl bg-slate-200">
                  <img
                    src="https://placehold.co/700x500/e2e8f0/64748b?text=Pho+Special"
                    alt="Phở bò đặc biệt"
                    className="h-52 w-full object-cover"
                  />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Giá</span>
                    <span className="font-semibold text-cyan-600">55.000đ</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Category</span>
                    <span className="font-semibold text-slate-700">
                      Phở & Bún
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Lượt thích</span>
                    <span className="font-semibold text-cyan-600">2.8K</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Category nav - sticky */}
          <div className="sticky top-4 z-20 -mx-1 flex gap-2 overflow-x-auto rounded-3xl border border-violet-100 bg-white/85 px-3 py-3 shadow-[0_10px_30px_rgba(167,139,250,0.1)] backdrop-blur-sm">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => scrollToCategory(c.id)}
                className={
                  activeCategory === c.id
                    ? "flex shrink-0 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                    : "flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                }
              >
                <span>{c.emoji}</span>
                {c.name}
                <span
                  className={
                    activeCategory === c.id
                      ? "ml-1 rounded-full bg-white/20 px-1.5 text-xs"
                      : "ml-1 rounded-full bg-slate-100 px-1.5 text-xs text-slate-500"
                  }
                >
                  {c.dishes.length}
                </span>
              </button>
            ))}
          </div>

          {/* Sections theo category */}
          {categories.map((category) => (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="mx-auto max-w-6xl scroll-mt-24 px-1"
            >
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-600">
                    {category.emoji} {category.name}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {category.tagline}
                  </h2>
                </div>
                <button
                  onClick={() => scrollToCategory(category.id)}
                  className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-cyan-300 hover:text-slate-900 sm:inline-flex"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {category.dishes.map((dish) => (
                  <Card
                    key={dish.name}
                    className="group overflow-hidden border border-violet-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_18px_40px_rgba(167,139,250,0.15)]"
                  >
                    <div className="relative">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      {dish.oldPrice && (
                        <Badge className="absolute right-3 top-3 border border-red-200 bg-red-500 text-white hover:bg-red-500">
                          -
                          {Math.round(
                            ((dish.oldPrice - dish.price) / dish.oldPrice) *
                              100,
                          )}
                          %
                        </Badge>
                      )}
                      <span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
                        {dish.tag}
                      </span>
                      <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                        🔥 {dish.rating}
                      </span>
                    </div>
                    <CardContent className="space-y-2 p-4">
                      <p className="line-clamp-1 text-base font-bold leading-5 text-slate-900">
                        {dish.name}
                      </p>
                      <p className="line-clamp-2 min-h-[34px] text-sm leading-5 text-slate-500">
                        {dish.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          {dish.kcal} kcal
                        </span>
                        <div className="flex items-baseline gap-2">
                          {dish.oldPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatPrice(dish.oldPrice)}
                            </span>
                          )}
                          <span className="text-lg font-black text-cyan-600">
                            {formatPrice(dish.price)}
                          </span>
                        </div>
                      </div>
                      <Button className="w-full rounded-xl bg-slate-100 text-sm text-slate-800 hover:bg-cyan-500 hover:text-white">
                        Thêm món ăn
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
            <Button className="mt-6 rounded-full bg-white text-cyan-700 hover:bg-white/90">
              Nhận mã ngay
            </Button>
          </section>
        </main>
      </div>
    </div>
  );
}
