import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const stats = [
  { label: "Đang theo dõi", value: "12", tone: "text-slate-900" },
  { label: "Đã đạt mục tiêu", value: "5", tone: "text-emerald-600" },
  { label: "Link affiliate", value: "3", tone: "text-orange-500" },
]

export default function Profile() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ece7ff_0%,#e4efff_26%,#e7edf5_100%)] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-[28px] border border-violet-100 bg-white/90 p-5 shadow-[0_18px_45px_rgba(167,139,250,0.08)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Profile</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Tài khoản của tôi</h1>
            </div>
            <Badge className="border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-50">Thành viên từ 2026</Badge>
          </div>
        </header>

        <Card className="overflow-hidden border border-violet-100 bg-white/90 shadow-[0_18px_35px_rgba(167,139,250,0.08)]">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16 border border-slate-200">
              <AvatarImage src="https://placehold.co/100x100/f3f4f6/64748b?text=A" />
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-xl font-bold text-slate-900">Nguyễn Văn A</p>
              <p className="text-sm text-slate-500">nguyenvana@email.com</p>
            </div>
            <Button className="rounded-full bg-cyan-500 text-white hover:bg-cyan-600">Cập nhật</Button>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label} className="border border-violet-100 bg-white/90 shadow-[0_12px_35px_rgba(167,139,250,0.08)]">
              <CardContent className="p-5 text-center">
                <p className={`text-3xl font-black ${item.tone}`}>{item.value}</p>
                <p className="mt-2 text-sm text-slate-500">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border border-violet-100 bg-white/90 shadow-[0_18px_35px_rgba(167,139,250,0.08)]">
          <CardHeader>
            <CardTitle className="text-slate-900">Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật họ tên và email của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Họ tên</Label>
              <Input id="name" defaultValue="Nguyễn Văn A" className="h-11 rounded-xl border-slate-200 bg-white text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input id="email" type="email" defaultValue="nguyenvana@email.com" className="h-11 rounded-xl border-slate-200 bg-white text-slate-900" />
            </div>
            <Button className="rounded-full bg-slate-900 text-white hover:bg-slate-800">Lưu thay đổi</Button>
          </CardContent>
        </Card>

        <Card className="border border-violet-100 bg-white/90 shadow-[0_18px_35px_rgba(167,139,250,0.08)]">
          <CardHeader>
            <CardTitle className="text-slate-900">Đổi mật khẩu</CardTitle>
            <CardDescription>Nên dùng mật khẩu mạnh và khác với các tài khoản khác.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-slate-700">Mật khẩu hiện tại</Label>
              <Input id="currentPassword" type="password" placeholder="••••••••" className="h-11 rounded-xl border-slate-200 bg-white text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-slate-700">Mật khẩu mới</Label>
              <Input id="newPassword" type="password" placeholder="Ít nhất 6 ký tự" className="h-11 rounded-xl border-slate-200 bg-white text-slate-900" />
            </div>
            <Button variant="outline" className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">Cập nhật mật khẩu</Button>
          </CardContent>
        </Card>

        <Card className="border border-red-200 bg-red-50/80 shadow-[0_18px_35px_rgba(239,68,68,0.06)]">
          <CardHeader>
            <CardTitle className="text-red-600">Xoá tài khoản</CardTitle>
            <CardDescription>Hành động này không thể hoàn tác.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="rounded-full">Xoá tài khoản của tôi</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}