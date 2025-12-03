import { api } from './client'
import type { LoginResponse, RegisterRequest, User } from './types'
import { clearToken } from './token'

export const authApi = {
  async login(login: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', { login, password })
    return res.data
  },

  async register(payload: RegisterRequest): Promise<User> {
    const res = await api.post<User>('/users', payload)
    return res.data
  },

  logout() {
    clearToken()
  },
}
