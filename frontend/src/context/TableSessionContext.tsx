import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { getTableSession } from "@/api/table"

interface TableSessionContextValue {
  tableSlug: string | null
  isLoading: boolean
  error: string | null
}

const TableSessionContext = createContext<TableSessionContextValue | null>(null)


export function TableSessionProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [tableSlug, setTableSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const slug = searchParams.get("table")
    if (!slug) return

    searchParams.delete("table")
    setSearchParams(searchParams, { replace: true })

    let cancelled = false
    setIsLoading(true)
    setError(null)

    void (async () => {
      try {
        await getTableSession(slug)
        if (!cancelled) setTableSlug(slug)
      } catch {
        if (!cancelled) setError("Không thể kết nối bàn. Vui lòng quét lại mã QR.")
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          navigate("/", { replace: true })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <TableSessionContext.Provider value={{ tableSlug, isLoading, error }}>
      {children}
    </TableSessionContext.Provider>
  )
}

export function useTableSession(): TableSessionContextValue {
  const ctx = useContext(TableSessionContext)
  if (!ctx) {
    throw new Error("useTableSession must be used within a TableSessionProvider")
  }
  return ctx
}