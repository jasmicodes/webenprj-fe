import { defineStore } from 'pinia'
import { api } from '@/services/api/client'
import { usersApi } from '@/services/api/users'
import { mediaApi } from '@/services/api/media'
import { logger } from '@/services/logger'
import type { LoginResponse, User } from '@/services/api/types'
import router from '@/router'
import { clearToken, getToken, isTokenExpired, setToken } from '@/services/api/token'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    user: null as User | null,
  }),

  getters: {
    /** Is any user logged in */
    isAuthenticated: (s) => !!s.token,

    /** Logged in user role helpers */
    isAdmin: (s) => s.user?.role === 'ADMIN',
    isUser: (s) => s.user?.role === 'USER',
  },

  actions: {
    /** Login with username OR email via backend API */
    async login(payload: { identifier: string; password: string }) {
      const res = await api.post<LoginResponse>('/auth/login', {
        login: payload.identifier,
        password: payload.password,
      })
      const response = res.data

      // Set state from API response
      this.token = response.token
      this.user = response.user
      setToken(response.token)
    },

    /** Fetch current user data (for session restoration on page refresh) */
    async fetchCurrentUser() {
      if (!this.token) {
        return
      }

      if (isTokenExpired(this.token)) {
        this.logout()
        return
      }

      try {
        this.user = await usersApi.getMyProfile()
      } catch (error) {
        // Token is invalid/expired, clear session
        logger.error('Failed to fetch current user:', error)
        this.logout()
      }
    },

    /** Logout */
    logout() {
      this.token = null
      this.user = null
      clearToken()
      router.push({ name: 'login' })
    },

    /** Update token (e.g., after credential change) */
    updateToken(newToken: string) {
      this.token = newToken
      setToken(newToken)
    },
    /**
     * Download profile image and return a blob URL.
     * IMPORTANT: Caller is responsible for revoking the returned URL
     * via URL.revokeObjectURL() to prevent memory leaks.
     */
    async downloadProfileImage() {
      if (!this.user?.profileImageUrl) {
        return null
      }

      try {
        // Validate URL format and extract ID, e.g. "/medias/abc-123" → "abc-123"
        const url = this.user.profileImageUrl
        const match = url.match(/\/medias\/([a-f0-9-]+)/i)
        if (!match?.[1]) {
          // Invalid URL format - log for debugging
          return null
        }
        const id = match[1]

        const blob = await mediaApi.retrieve(id)
        const objectUrl = URL.createObjectURL(blob)
        return objectUrl
      } catch {
        // Failed to load profile image - return null to use fallback
        return null
      }
    },

  },

})
