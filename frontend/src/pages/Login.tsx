import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/api/client"
import { useAuth } from "@/context/AuthContext"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu")
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate("/")
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Sai email hoặc mật khẩu. Vui lòng thử lại.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] px-4 py-8 text-slate-800">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] border border-violet-100 bg-white shadow-[0_24px_60px_rgba(167,139,250,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),transparent_30%),linear-gradient(135deg,#f0fdfd_0%,#eff6ff_35%,#f8fafc_100%)] p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,116,144,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,116,144,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 text-slate-900 hover:text-cyan-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white">
                T
              </div>
              <span className="text-xl font-semibold">Trackly</span>
            </Link>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-700">
              Smart price tracker
            </div>

            <h1 className="max-w-md text-4xl font-black leading-tight tracking-tight text-slate-900">
              Theo dõi giá, tiết kiệm thời gian và tiền bạc.
            </h1>

            <p className="max-w-md text-base text-slate-600">
              Theo dõi sản phẩm bạn thích, nhận cảnh báo giảm giá và cập nhật xu hướng giá từ Shopee & TikTok.
            </p>
          </div>

          <div className="relative z-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
              <p className="text-xl font-bold text-slate-900">12.4K</p>
              <p className="text-xs text-slate-600">Sản phẩm</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
              <p className="text-xl font-bold text-slate-900">8.6%</p>
              <p className="text-xs text-slate-600">Giảm giá</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
              <p className="text-xl font-bold text-slate-900">96%</p>
              <p className="text-xs text-slate-600">Hài lòng</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <Card className="w-full max-w-md border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.22em] text-cyan-600">Welcome back</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Đăng nhập</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ban@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700">Mật khẩu</Label>
                    <a href="#" className="text-xs text-cyan-600 hover:text-cyan-700">
                      Quên mật khẩu?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-cyan-500 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-600"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-slate-500">
                  <span className="bg-white px-2">Hoặc</span>
                </div>
              </div>

              <Button className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Tiếp tục với Google
              </Button>

              <p className="text-center text-sm text-slate-600">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="font-semibold text-cyan-600 hover:text-cyan-700">
                  Đăng ký ngay
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}