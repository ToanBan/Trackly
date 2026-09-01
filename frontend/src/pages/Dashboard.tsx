import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const watchlist = [
  {
    id: 1,
    name: "Tai nghe Bluetooth XYZ Pro",
    image: "https://placehold.co/120x120/f3f4f6/64748b?text=Audio",
    currentPrice: 459000,
    targetPrice: 400000,
    reached: false,
    platform: "Shopee",
    status: "Giảm 48%",
  },
  {
    id: 2,
    name: "Nồi chiên không dầu 5L",
    image: "https://placehold.co/120x120/f3f4f6/64748b?text=Kitchen",
    currentPrice: 940000,
    targetPrice: 950000,
    reached: true,
    platform: "TikTok",
    status: "Đã đạt mục tiêu",
  },
  {
    id: 3,
    name: "Bàn phím cơ RGB 87 phím",
    image: "https://placehold.co/120x120/f3f4f6/64748b?text=Gaming",
    currentPrice: 749000,
    targetPrice: 700000,
    reached: false,
    platform: "Shopee",
    status: "Còn 49k để đạt",
  },
]

const stats = [
  { label: "Đang theo dõi", value: "12" },
  { label: "Đã giảm giá", value: "5" },
  { label: "Tổng tiết kiệm", value: "3.4M" },
]

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ"
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[28px] border border-violet-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(167,139,250,0.08)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Dashboard</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Sản phẩm đang theo dõi</h1>
            </div>
            <Button className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600">+ Thêm sản phẩm</Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label} className="border border-violet-100 bg-white/90 shadow-[0_12px_35px_rgba(167,139,250,0.08)]">
              <CardContent className="p-5">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          {watchlist.map((item) => (
            <Card key={item.id} className="overflow-hidden border border-slate-200 bg-white/90 shadow-[0_18px_35px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_20px_40px_rgba(167,139,250,0.12)]">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover border border-slate-200" />

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-semibold text-slate-900">{item.name}</p>
                    <Badge className="border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-50">{item.platform}</Badge>
                  </div>

                  <div className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                    <p>
                      Giá hiện tại: <span className="font-semibold text-slate-900">{formatPrice(item.currentPrice)}</span>
                    </p>
                    <p>
                      Giá mục tiêu: <span className="font-semibold text-cyan-600">{formatPrice(item.targetPrice)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <Badge className={item.reached ? "border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100"}>
                    {item.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-100">Xem</Button>
                    <Button variant="outline" className="rounded-full border-red-200 text-red-600 hover:bg-red-50">Xoá</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}