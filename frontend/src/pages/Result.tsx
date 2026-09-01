import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const priceHistory = [
  { date: "01/08", price: 890000 },
  { date: "08/08", price: 850000 },
  { date: "15/08", price: 790000 },
  { date: "22/08", price: 650000 },
  { date: "29/08", price: 459000 },
]

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ"
}

export default function Result() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="overflow-hidden border border-violet-100 bg-white/90 shadow-[0_18px_45px_rgba(167,139,250,0.08)]">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative">
                <img
                  src="https://placehold.co/260x260/f3f4f6/64748b?text=Product"
                  alt="Sản phẩm"
                  className="h-40 w-40 rounded-[28px] object-cover border border-slate-200 shadow-sm sm:h-52 sm:w-52"
                />
                <Badge className="absolute right-3 top-3 border border-red-200 bg-red-500 text-white hover:bg-red-500">-48%</Badge>
              </div>

              <div className="flex-1">
                <p className="mb-2 text-sm uppercase tracking-[0.2em] text-cyan-600">Price tracker</p>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Tai nghe Bluetooth chống ồn XYZ Pro
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <p className="text-3xl font-black text-cyan-600">{formatPrice(459000)}</p>
                  <span className="text-sm text-slate-500 line-through">{formatPrice(890000)}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600">Theo dõi giá</Button>
                  <Button variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">Lấy link Affiliate</Button>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 text-sm text-slate-600">
                  <span className="flex-1 truncate">https://shope.ee/xyz123abc</span>
                  <Button size="sm" className="rounded-full bg-slate-900 text-white hover:bg-slate-800">Copy</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-violet-100 bg-white/90 shadow-[0_18px_45px_rgba(167,139,250,0.08)]">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Lịch sử giá</h2>
              <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Giảm 48%</Badge>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => {
                      const numericValue = Array.isArray(value)
                        ? Number(value[0] ?? 0)
                        : Number(value ?? 0)

                      return [formatPrice(numericValue), "Giá"]
                    }}
                    contentStyle={{ borderRadius: 16, border: "1px solid #c4b5fd", boxShadow: "0 10px 30px rgba(167,139,250,0.12)" }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: "#06b6d4" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}