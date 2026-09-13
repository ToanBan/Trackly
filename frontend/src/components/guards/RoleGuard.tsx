import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import type { User } from "@/api/auth"

interface RoleGuardProps {
  allow: (user: User) => boolean
  redirectTo?: string
  children: ReactNode
}


export default function RoleGuard({ allow, redirectTo = "/", children }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-400">Đang tải…</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!allow(user)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}