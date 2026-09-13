import { api, doRefreshTokens } from "./client"

export interface User {
  id: number
  username: string
  email: string
  roles?: string[]
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginResponse {
  message: string
}

export interface RegisterResponse {
  message: string
  user: User
}

export async function handleLogin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/login", { email, password })
  return data
}

export async function handleRegister(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/register", payload)
  return data
}


export async function handleRefreshToken(): Promise<void> {
  await doRefreshTokens()
}

export async function handleLogout(): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>("/logout")
  return data
}

export async function handleFetchMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me")
  return data
}