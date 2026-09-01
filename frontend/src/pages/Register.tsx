import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin")
      return
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 700))
      navigate("/login")
    } catch {
      setError("Đăng ký thất bại. Vui lòng thử lại.")
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
              Start saving smarter
            </div>

            <h1 className="max-w-md text-4xl font-black leading-tight tracking-tight text-slate-900">
              Tạo tài khoản để bắt đầu săn deal mỗi ngày.
            </h1>

            <p className="max-w-md text-base text-slate-600">
              Đăng ký miễn phí để nhận thông báo khi giá sản phẩm bạn yêu thích giảm, cùng nhiều ưu đãi hấp dẫn.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <p className="text-sm text-slate-600">Lợi ích ngay khi đăng ký</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Cảnh báo giá tức thì</li>
              <li>• Duyệt danh sách khuyến mãi hot</li>
              <li>• Lưu sản phẩm yêu thích</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <Card className="w-full max-w-md border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.22em] text-cyan-600">Join us</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Đăng ký</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">Họ tên</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

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
                  <Label htmlFor="password" className="text-slate-700">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ít nhất 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-700">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-cyan-500 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-600"
                >
                  {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
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
                Đã có tài khoản?{" "}
                <Link to="/login" className="font-semibold text-cyan-600 hover:text-cyan-700">
                  Đăng nhập
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}