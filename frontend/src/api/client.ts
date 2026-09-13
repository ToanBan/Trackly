import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios"


export const BASE_URL =
  import.meta.env.VITE_API_URL ?? "/api"


const MAX_REFRESH_RETRIES = 1

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: number
  _skipRefresh?: boolean
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
})

let refreshPromise: Promise<void> | null = null


export async function doRefreshTokens(): Promise<void> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = api
    .post<void>("/refresh-token", null, {
      _skipRefresh: true,
    } as unknown as AxiosRequestConfig)
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    const status = error.response?.status ?? 0

    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      "Vui lòng thử lại."

    if (
      original &&
      status === 401 &&
      (original._retry ?? 0) < MAX_REFRESH_RETRIES &&
      !original._skipRefresh
    ) {
      original._retry = (original._retry ?? 0) + 1

      try {
        await doRefreshTokens()
        console.log("đã gọi refresh token")
      } catch {
        console.error("Auto refresh token failed; request will not be retried.", error.response?.status)
        return Promise.reject(new ApiError(status, message))
      }


      return api(original)
    }

    return Promise.reject(new ApiError(status, message))
  },
)