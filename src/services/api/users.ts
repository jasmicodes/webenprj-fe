import { api } from './client'
import type {
  User,
  AdminUser,
  UpdateProfileRequest,
  ProfileUpdateResponse,
  ChangePasswordRequest,
  ChangeEmailRequest,
  UserRole,
  Page,
  Post,
} from './types'

export const usersApi = {
  async getMyProfile(): Promise<User> {
    const res = await api.get<User>('/users/me')
    return res.data
  },

  /**
   * Get public user profile by ID
   */
  async getUserById(userId: string): Promise<User> {
    const res = await api.get<User>(`/users/${userId}`)
    return res.data
  },

  /**
   * Search users by username, email, or country code
   */
  async searchUsers(query: string, page = 0, size = 20): Promise<Page<User>> {
    const res = await api.get<Page<User>>('/users', {
      params: { search: query, page, size },
    })
    return res.data
  },

  /**
   * Check if current user is following the specified user
   */
  async isFollowing(userId: string): Promise<boolean> {
    try {
      const res = await api.get<{ following: boolean }>(`/users/${userId}/following-status`)
      return res.data.following
    } catch {
      // If endpoint doesn't exist, fall back to checking followers list
      return false
    }
  },

  async updateMyProfile(payload: UpdateProfileRequest): Promise<ProfileUpdateResponse> {
    const res = await api.put<ProfileUpdateResponse>('/users/me', payload)
    return res.data
  },

  /**
   * Remove avatar (set to null/placeholder)
   * Returns updated user with null profileImageUrl
   */
  async removeAvatar(): Promise<ProfileUpdateResponse> {
    const res = await api.delete<ProfileUpdateResponse>('/users/me/avatar')
    return res.data
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await api.patch('/users/me/password', payload)
  },

  async changeEmail(payload: ChangeEmailRequest): Promise<ProfileUpdateResponse> {
    const res = await api.patch<ProfileUpdateResponse>('/users/me/email', payload)
    return res.data
  },

  /**
   * Get user activity status (includes whether they posted today)
   */
  async getActivity(): Promise<{ hasPostedToday: boolean }> {
    const res = await api.get<{ hasPostedToday: boolean }>('/users/me/activity')
    return res.data
  },

  /**
   * Get current user's posts and comments (all activity)
   */
  async getMyPosts(page = 0, size = 10): Promise<Page<Post>> {
    const res = await api.get<Page<Post>>('/users/me/posts', { params: { page, size } })
    return res.data
  },
}

/**
 * Get total registered user count (public endpoint, no auth required).
 * Used for displaying community size on login page.
 */
export async function getUserCount(): Promise<{ count: number }> {
  const res = await api.get<{ count: number }>('/users/count')
  return res.data
}

export const adminUsersApi = {
  /**
   * Get all users or search users by email, username, or country code.
   * RESTful design: use query parameter to filter collection.
   * @param search Optional search query to filter users
   */
  async getAllUsers(search?: string, page = 0, size = 20): Promise<Page<AdminUser>> {
    const res = await api.get<Page<AdminUser>>('/users', {
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
    data: Partial<UpdateProfileRequest> & {
      role?: UserRole
      active?: boolean
    },
  ): Promise<AdminUser> {
    const res = await api.put<AdminUser>(`/users/${id}`, data)
    return res.data
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  /**
   * Remove avatar for a specific user (admin only)
   * @param id User UUID
   */
  async removeUserAvatar(id: string): Promise<AdminUser> {
    const res = await api.delete<AdminUser>(`/users/${id}/avatar`)
    return res.data
  },

  /**
   * Toggle user active status (activate/deactivate)
   * Uses dedicated PATCH endpoint for atomic status updates
   * @param id User UUID
   * @param active New active status
   */
  async toggleUserActive(id: string, active: boolean): Promise<AdminUser> {
    const res = await api.patch<AdminUser>(`/users/${id}/active`, null, {
      params: { active },
    })
    return res.data
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
