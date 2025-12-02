import { defineStore } from 'pinia'
import { authApi } from '@/services/api/auth'
import router from '@/router'

type User = {
  id: number
  username: string
  email: string
  role: 'user' | 'admin'
}

// Nur intern für Demo-Login:
type DemoUser = User & { password: string }

// Demo-Daten für Milestone 1
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@motivise.app',
    password: 'demo',
    role: 'user',
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@motivise.app',
    password: 'admin',
    role: 'admin',
  },
]

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') as string | null,
    user: null as User | null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
  },

  actions: {
    /** Login mit Username ODER Email */
    async login(payload: { identifier: string; password: string }) {
      // Identifier prüfen
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.identifier)

      // Demo-User suchen
      const found = DEMO_USERS.find((u) =>
        isEmail
          ? u.email === payload.identifier && u.password === payload.password
          : u.username === payload.identifier && u.password === payload.password,
      )

      if (!found) throw new Error('Invalid username/email or password')

      // Token simulieren
      const fakeToken = 'demo-token-' + found.username

      // Zustand setzen
      this.token = fakeToken
      this.user = {
        id: found.id,
        username: found.username,
        email: found.email,
        role: found.role,
      }

      localStorage.setItem('token', fakeToken)
      router.push({ name: 'home' })
    },

    /** Demo-Registration – optional für später */
    async register(payload: { username: string; email: string; password: string }) {
      // nur Demo → sofortiger Erfolg
      const fakeUser: User = {
        id: Math.floor(Math.random() * 1000),
        username: payload.username,
        email: payload.email,
        role: 'user',
      }
      const fakeToken = 'demo-token-' + fakeUser.username

      this.user = fakeUser
      this.token = fakeToken
      localStorage.setItem('token', fakeToken)
      router.push({ name: 'home' })
    },

    /** Logout */
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      router.push({ name: 'login' })
    },
  },
})
