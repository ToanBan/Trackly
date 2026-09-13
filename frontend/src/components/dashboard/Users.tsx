import { useCallback, useEffect, useState } from "react";
import {
  getUsers, setUserRoles,
  type UserRole, type UserSummary, type CustomerLoyalty,
} from "@/api/users";
import { SectionTitle, ConfirmDialog } from "./sharedUI";

const PAGE_SIZE = 10;

export default function Users() {
  const [tab, setTab] = useState<UserRole>("user");
  const [items, setItems] = useState<(UserSummary | CustomerLoyalty)[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{
    user: UserSummary | CustomerLoyalty;
    to: UserRole;
  } | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getUsers(tab, page, PAGE_SIZE);
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
      setNeedLogin(false);
      if (!silent) setError(null);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 401) setNeedLogin(true);
      else if (!silent) setError("Không thể tải danh sách người dùng.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    void load();
    const poll = setInterval(() => void load(true), 30_000);
    return () => clearInterval(poll);
  }, [load]);

  const switchTab = (r: UserRole) => {
    setTab(r);
    setPage(1);
  };

  const applyRole = async (id: number, to: UserRole) => {
    setBusyId(id);
    try {
      await setUserRoles(id, [to]);
      setConfirm(null);
      await load(true);
      if (total <= 1 && page > 1) setPage((p) => p - 1);
    } catch {
      alert("Không thể đổi vai trò. Vui lòng thử lại.");
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Người dùng"
        subtitle="Tất cả tài khoản · chọn role để đổi quyền"
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "user" as const, label: "Khách hàng (user)" },
            { id: "staff" as const, label: "Nhân viên (staff)" },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={
              tab === t.id
                ? "rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-violet-200"
                : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-violet-50"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {needLogin && (
        <p className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-bold text-rose-600">
          Cần đăng nhập để xem danh sách người dùng.
        </p>
      )}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3">
          <p className="text-sm font-bold text-rose-600">{error}</p>
          <button
            onClick={() => void load()}
            className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-black text-white hover:bg-rose-700"
          >
            Thử lại
          </button>
        </div>
      )}
{loading && (
        <div className="flex items-center justify-center rounded-2xl border border-violet-100 bg-white/95 py-16 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="rounded-2xl border border-violet-100 bg-white/95 px-5 py-16 text-center text-sm text-slate-400">
          {tab === "staff"
            ? "Chưa có nhân viên nào — chuyển tab Khách hàng để cấp quyền."
            : "Chưa có khách hàng nào."}
        </p>
      )}

      {!loading && items.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-violet-100 bg-white/95 shadow-[0_16px_35px_rgba(167,139,250,0.08)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Mã</th>
                <th className="px-5 py-3">Tên người dùng</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Vai trò</th>
                {tab === "user" && <th className="px-5 py-3">Điểm</th>}
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((u) => {
                const isStaff = "roles" in u && u.roles.includes("staff");
                return (
                  <tr key={u.id} className="transition hover:bg-violet-50/40">
                    <td className="px-5 py-3 font-bold text-slate-800">#{u.id}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {u.username}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          isStaff
                            ? "bg-amber-100 text-amber-700"
                            : "bg-violet-100 text-violet-700"
                        }`}
                      >
                        {isStaff ? "Nhân viên" : "Khách hàng"}
                      </span>
                    </td>
                    {tab === "user" && (
                      <td className="px-5 py-3 font-black tabular-nums text-violet-600">
                        {"points" in u ? u.points.toLocaleString("vi-VN") : 0}
                      </td>
                    )}
                    <td className="px-5 py-3 text-right">
                      <button
                        disabled={busyId === u.id}
                        onClick={() => setConfirm({ user: u, to: isStaff ? "user" : "staff" })}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                          isStaff
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                        }`}
                      >
                        {isStaff ? "Thu hồi quyền" : "Cấp quyền nhân viên"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {total} người dùng · trang {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-600 transition hover:bg-violet-50 disabled:opacity-40"
            >
              ‹ Trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-bold text-slate-600 transition hover:bg-violet-50 disabled:opacity-40"
            >
              Sau ›
            </button>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.to === "staff" ? "Cấp quyền nhân viên" : "Thu hồi quyền nhân viên"}
          message={`Bạn có chắc muốn ${
            confirm.to === "staff" ? "cấp quyền nhân viên" : "thu hồi quyền"
          } cho "${confirm.user.username}"${
            confirm.to === "staff" ? "?" : " (trở thành khách hàng)?"
          }`}
          confirmLabel={confirm.to === "staff" ? "Cấp quyền" : "Thu hồi quyền"}
          danger={confirm.to !== "staff"}
          onCancel={() => setConfirm(null)}
          onConfirm={() => void applyRole(confirm.user.id, confirm.to)}
        />
      )}
    </div>
  );
}