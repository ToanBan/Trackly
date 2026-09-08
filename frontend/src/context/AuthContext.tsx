import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  handleFetchMe,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleRegister,
  type RegisterPayload,
  type User,
} from "@/api/auth"
import { ApiError } from "@/api/client"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  fetchMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchMe() {
    const me = await handleFetchMe()
    setUser(me)
  }

  async function login(email: string, password: string) {
    // Sets HttpOnly auth cookies, then loads the user profile.
    await handleLogin(email, password)
    await fetchMe()
  }

  async function register(payload: RegisterPayload) {
    await handleRegister(payload)
  }

  async function logout() {
    try {
      await handleLogout()
    } finally {
      setUser(null)
    }
  }

  async function refreshToken() {
    await handleRefreshToken()
  }


  useEffect(() => {
    void (async () => {
      try {
        await fetchMe()
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          // Access token expired while away -> rotate it once, then retry.
          try {
            await refreshToken()
            await fetchMe()
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    fetchMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}