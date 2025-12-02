import { api } from './client'
import type { User, UpdateProfileRequest, ChangePasswordRequest, UserRole } from './types'

export const usersApi = {
  async getMyProfile(): Promise<User> {
    const res = await api.get<User>('/users/me')
    return res.data
  },

  async updateMyProfile(payload: UpdateProfileRequest): Promise<User> {
    const res = await api.put<User>('/users/me', payload)
    return res.data
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await api.patch('/users/me/password', payload)
  },
}

export const adminUsersApi = {
  async getAllUsers(): Promise<User[]> {
    const res = await api.get<User[]>('/users')
    return res.data
  },

  async updateUser(
    id: string,
    data: Partial<UpdateProfileRequest> & { role?: UserRole }
  ): Promise<User> {
    const res = await api.put<User>(`/users/${id}`, data)
    return res.data
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
