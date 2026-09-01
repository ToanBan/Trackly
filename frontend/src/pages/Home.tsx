import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const quickTags = ["Điện tử", "Gia dụng", "Thời trang", "Mẹ & Bé"]

const stats = [
  { label: "Sản phẩm đang theo dõi", value: "12.4K" },
  { label: "Giảm giá hôm nay", value: "8.6%" },
  { label: "Người dùng tin tưởng", value: "96.2%" },
]

const mockProducts = [
  {
    id: 1,
    name: "Tai nghe Bluetooth chống ồn XYZ Pro",
    image: "https://placehold.co/700x700/e2e8f0/64748b?text=Audio",
    oldPrice: 890000,
    newPrice: 459000,
    discount: 48,
    tag: "Bán chạy",
  },
  {
    id: 2,
    name: "Nồi chiên không dầu 5L Deluxe",
    image: "https://placehold.co/700x700/e2e8f0/64748b?text=Kitchen",
    oldPrice: 1590000,
    newPrice: 990000,
    discount: 38,
    tag: "Hot",
  },
  {
    id: 3,
    name: "Áo khoác gió unisex 2 lớp",
    image: "https://placehold.co/700x700/e2e8f0/64748b?text=Fashion",
    oldPrice: 350000,
    newPrice: 179000,
    discount: 49,
    tag: "Mới",
  },
  {
    id: 4,
    name: "Bàn phím cơ RGB 87 phím",
    image: "https://placehold.co/700x700/e2e8f0/64748b?text=Gaming",
    oldPrice: 1200000,
    newPrice: 749000,
    discount: 38,
    tag: "Giảm sâu",
  },
]

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ"
}

export default function Home() {
  const [link, setLink] = useState("")

  const handleSearch = () => {
    console.log("Tra cứu link:", link)
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-full border border-violet-100 bg-white/85 px-4 py-3 shadow-[0_10px_30px_rgba(167,139,250,0.08)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white">
              T
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">Trackly</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#" className="transition hover:text-slate-900">Trang chủ</a>
            <a href="#" className="transition hover:text-slate-900">Giảm giá</a>
            <a href="#" className="transition hover:text-slate-900">Theo dõi</a>
            <a href="#" className="transition hover:text-slate-900">Hỗ trợ</a>
          </nav>

          <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
            Đăng nhập
          </Button>
        </header>

        <main className="space-y-8">
          <section className="relative overflow-hidden rounded-[32px] border border-violet-100 bg-[radial-gradient(circle_at_top_left,_rgba(196,181,253,0.38),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(125,211,252,0.26),transparent_32%),linear-gradient(135deg,#f5f3ff_0%,#eff6ff_35%,#fefefe_100%)] p-6 shadow-[0_30px_60px_rgba(167,139,250,0.12)] sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(14,116,144,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,116,144,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <Badge className="mb-4 inline-flex rounded-full border border-cyan-300 bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
                  Theo dõi giá real-time
                </Badge>

                <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Theo dõi giá <span className="text-cyan-600">Shopee</span> & TikTok cực nhanh
                </h1>

                <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
                  Dán link sản phẩm để xem lịch sử giá, phát hiện khuyến mãi và nhận cảnh báo khi giá giảm.
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
                    placeholder="Dán link sản phẩm Shopee hoặc TikTok vào đây..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="h-14 rounded-2xl border-slate-200 bg-white text-base text-slate-900 placeholder:text-slate-400"
                  />
                  <Button
                    onClick={handleSearch}
                    className="h-14 rounded-2xl bg-cyan-500 px-6 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-600"
                  >
                    Tra cứu
                  </Button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-violet-100 bg-white/90 p-3 shadow-[0_8px_24px_rgba(167,139,250,0.08)]">
                      <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-600">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-violet-100 bg-white/95 p-4 shadow-[0_20px_50px_rgba(167,139,250,0.12)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Giá hiện tại</p>
                    <p className="text-3xl font-bold text-slate-900">459.000đ</p>
                  </div>
                  <Badge className="bg-red-100 text-red-600 hover:bg-red-100">-48%</Badge>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#e0f2fe_100%)] p-4">
                  <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
                    <span>Thông tin sản phẩm</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Đang giảm</span>
                  </div>

                  <div className="overflow-hidden rounded-2xl bg-slate-200">
                    <img
                      src="https://placehold.co/700x500/e2e8f0/64748b?text=Product+Preview"
                      alt="Preview"
                      className="h-52 w-full object-cover"
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Giá gốc</span>
                      <span className="text-slate-700 line-through">890.000đ</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Tăng trưởng</span>
                      <span className="font-semibold text-emerald-600">+12.4%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Lần xem</span>
                      <span className="font-semibold text-cyan-600">2.8K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-1 pb-2">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-cyan-600">Trending</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Top giảm giá hôm nay</h2>
              </div>
              <button className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-cyan-300 hover:text-slate-900 sm:inline-flex">
                Xem tất cả
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {mockProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden border border-violet-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_18px_40px_rgba(167,139,250,0.15)]"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <Badge className="absolute right-3 top-3 border border-red-200 bg-red-500 text-white hover:bg-red-500">
                      -{product.discount}%
                    </Badge>
                    <span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
                      {product.tag}
                    </span>
                  </div>

                  <CardContent className="space-y-3 p-4">
                    <p className="min-h-[42px] text-sm font-medium leading-5 text-slate-700 line-clamp-2">
                      {product.name}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-cyan-600">
                          {formatPrice(product.newPrice)}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full rounded-xl bg-slate-100 text-sm text-slate-800 hover:bg-cyan-500 hover:text-white">
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}