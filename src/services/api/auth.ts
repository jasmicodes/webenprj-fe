import { api } from './client'
import type { LoginResponse, RegisterRequest, User } from './types'

export const authApi = {
  async login(login: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', { login, password })
    localStorage.setItem('token', res.data.token)
    return res.data
  },

  async register(payload: RegisterRequest): Promise<User> {
    const res = await api.post<User>('/users', payload)
    return res.data
  },

  logout() {
    localStorage.removeItem('token')
  },
}
