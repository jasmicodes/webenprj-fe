import { defineStore } from 'pinia'
import { authApi } from '@/services/api/auth'
import { usersApi } from '@/services/api/users'
import type { User } from '@/services/api/types'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') as string | null,
    user: null as User | null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
  },

  actions: {
    /** Login with username OR email via backend API */
    async login(payload: { identifier: string; password: string }) {
      const response = await authApi.login(payload.identifier, payload.password)

      // Set state from API response
      this.token = response.token
      this.user = response.user

      // Token is already saved in localStorage by authApi.login()
    },

    /** Fetch current user data (for session restoration on page refresh) */
    async fetchCurrentUser() {
      if (!this.token) {
        return
      }

      try {
        this.user = await usersApi.getMyProfile()
      } catch (error) {
        // Token is invalid/expired, clear session
        console.error('Failed to fetch current user:', error)
        this.logout()
      }
    },

    /** Logout */
    logout() {
      this.token = null
      this.user = null
      authApi.logout()
      router.push({ name: 'login' })
    },
  },
})
