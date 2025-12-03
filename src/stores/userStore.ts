import { defineStore } from 'pinia'
import { authApi } from '@/services/api/auth'
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
      router.push({ name: 'home' })
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
