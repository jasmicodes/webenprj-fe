import { api } from './client'
import type {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserRole,
  Page,
} from './types'

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
  /**
   * Get all users or search users by email, username, or country code.
   * RESTful design: use query parameter to filter collection.
   * @param search Optional search query to filter users
   */
  async getAllUsers(search?: string, page = 0, size = 20): Promise<Page<User>> {
    const res = await api.get<Page<User>>('/users', {
      params: {
        page,
        size,
        ...(search ? { search } : {}),
      },
    })
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

export const followApi = {
  async follow(userId: string): Promise<void> {
    await api.post(`/users/${userId}/follow`)
  },
  async unfollow(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/follow`)
  },
  async getFollowers(userId: string, page = 0, size = 20): Promise<Page<User>> {
    const res = await api.get<Page<User>>(`/users/${userId}/followers`, { params: { page, size } })
    return res.data
  },
  async getFollowing(userId: string, page = 0, size = 20): Promise<Page<User>> {
    const res = await api.get<Page<User>>(`/users/${userId}/following`, { params: { page, size } })
    return res.data
  },
}
