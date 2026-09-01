import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const products = [
  { id: 1, name: "Tai nghe Bluetooth chống ồn", platform: "Shopee", price: 459000, discount: 48, image: "https://placehold.co/300x300/f3f4f6/64748b?text=Audio" },
  { id: 2, name: "Nồi chiên không dầu 5L", platform: "TikTok", price: 990000, discount: 38, image: "https://placehold.co/300x300/f3f4f6/64748b?text=Kitchen" },
  { id: 3, name: "Áo khoác gió unisex", platform: "Shopee", price: 179000, discount: 49, image: "https://placehold.co/300x300/f3f4f6/64748b?text=Fashion" },
  { id: 4, name: "Bàn phím cơ RGB 87 phím", platform: "TikTok", price: 749000, discount: 38, image: "https://placehold.co/300x300/f3f4f6/64748b?text=Gaming" },
]

const filters = [
  { label: "Tất cả", active: true },
  { label: "Shopee", active: false },
  { label: "TikTok", active: false },
]

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ"
}

export default function Discover() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[28px] border border-violet-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(167,139,250,0.08)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Discover</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Khám phá sản phẩm giảm giá</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter.label}
                  size="sm"
                  className={filter.active ? "rounded-full bg-cyan-500 text-white hover:bg-cyan-600" : "rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </header>

        <section className="rounded-[28px] border border-violet-100 bg-white/85 p-4 shadow-[0_18px_40px_rgba(167,139,250,0.07)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm text-slate-500">Ngành hàng</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="rounded-full bg-slate-900 text-white hover:bg-slate-800">Tất cả</Button>
                <Button size="sm" variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700">Điện tử</Button>
                <Button size="sm" variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700">Thời trang</Button>
                <Button size="sm" variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700">Gia dụng</Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-500">Sắp xếp</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="rounded-full bg-cyan-50 text-cyan-700 hover:bg-cyan-100">Giảm giá sâu nhất</Button>
                <Button size="sm" variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700">Mới cập nhật</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden border border-slate-200 bg-white/90 shadow-[0_18px_35px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_20px_40px_rgba(167,139,250,0.14)]">
              <div className="relative">
                <img src={product.image} alt={product.name} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                <Badge className="absolute right-3 top-3 border border-red-200 bg-red-500 text-white hover:bg-red-500">-{product.discount}%</Badge>
                <Badge variant="secondary" className="absolute left-3 top-3 bg-white/90 text-slate-700 hover:bg-white/90">{product.platform}</Badge>
              </div>
              <CardContent className="space-y-3 p-4">
                <p className="min-h-[42px] text-sm font-medium leading-5 text-slate-700 line-clamp-2">{product.name}</p>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-black text-cyan-600">{formatPrice(product.price)}</span>
                  <Button size="sm" className="rounded-full bg-cyan-50 text-cyan-700 hover:bg-cyan-500 hover:text-white">Xem</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}