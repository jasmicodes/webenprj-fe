import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from './userStore'

// Mock the API modules
vi.mock('@/services/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

vi.mock('@/services/api/users', () => ({
  usersApi: {
    getMyProfile: vi.fn(),
  },
}))

vi.mock('@/services/api/media', () => ({
  mediaApi: {
    retrieve: vi.fn(),
  },
}))

vi.mock('@/services/api/token', () => ({
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  clearToken: vi.fn(),
  isTokenExpired: vi.fn(() => false),
}))

vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  },
}))

import { authApi } from '@/services/api/auth'
import { usersApi } from '@/services/api/users'
import { mediaApi } from '@/services/api/media'
import { getToken, setToken, clearToken, isTokenExpired } from '@/services/api/token'
import router from '@/router'

describe('userStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have null token initially when no token stored', () => {
      vi.mocked(getToken).mockReturnValue(null)
      const store = useUserStore()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })

    it('should load token from storage on initialization', () => {
      vi.mocked(getToken).mockReturnValue('stored-token')
      const store = useUserStore()

      expect(store.token).toBe('stored-token')
    })
  })

  describe('getters', () => {
    it('isAuthenticated should return false when no token', () => {
      vi.mocked(getToken).mockReturnValue(null)
      const store = useUserStore()

      expect(store.isAuthenticated).toBe(false)
    })

    it('isAuthenticated should return true when token exists', () => {
      vi.mocked(getToken).mockReturnValue('valid-token')
      const store = useUserStore()

      expect(store.isAuthenticated).toBe(true)
    })

    it('isAdmin should return true for admin user', () => {
      vi.mocked(getToken).mockReturnValue('token')
      const store = useUserStore()
      store.user = {
        id: '123',
        email: 'admin@example.com',
        username: 'admin',
        role: 'ADMIN',
        countryCode: 'AT',
        profileImageUrl: 'https://example.com/profile.png',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      expect(store.isAdmin).toBe(true)
      expect(store.isUser).toBe(false)
    })

    it('isUser should return true for regular user', () => {
      vi.mocked(getToken).mockReturnValue('token')
      const store = useUserStore()
      store.user = {
        id: '123',
        email: 'user@example.com',
        username: 'user',
        role: 'USER',
        countryCode: 'AT',
        profileImageUrl: 'https://example.com/profile.png',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      expect(store.isUser).toBe(true)
      expect(store.isAdmin).toBe(false)
    })
  })

  describe('login action', () => {
    it('should set token and user on successful login', async () => {
      const mockResponse = {
        token: 'new-jwt-token',
        user: {
          id: '123',
          email: 'test@example.com',
          username: 'testuser',
          role: 'USER' as const,
          countryCode: 'AT',
          profileImageUrl: 'https://example.com/profile.png',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      }

      vi.mocked(authApi.login).mockResolvedValue(mockResponse)
      vi.mocked(getToken).mockReturnValue(null)

      const store = useUserStore()
      await store.login({ identifier: 'test@example.com', password: 'password123' })

      expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(store.token).toBe('new-jwt-token')
      expect(store.user).toEqual(mockResponse.user)
      expect(setToken).toHaveBeenCalledWith('new-jwt-token')
    })

    it('should throw error on failed login', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))
      vi.mocked(getToken).mockReturnValue(null)

      const store = useUserStore()

      await expect(
        store.login({ identifier: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials')

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })

  describe('logout action', () => {
    it('should clear token, user, and redirect to login', () => {
      vi.mocked(getToken).mockReturnValue('token')
      const store = useUserStore()
      store.token = 'some-token'
      store.user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'USER',
        countryCode: 'AT',
        profileImageUrl: 'https://example.com/profile.png',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(clearToken).toHaveBeenCalled()
      expect(authApi.logout).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith({ name: 'login' })
    })
  })

  describe('fetchCurrentUser action', () => {
    it('should fetch user profile when token exists and is valid', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'USER',
        countryCode: 'AT',
        profileImageUrl: 'https://example.com/profile.png',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      } as const

      vi.mocked(getToken).mockReturnValue('valid-token')
      vi.mocked(isTokenExpired).mockReturnValue(false)
      vi.mocked(usersApi.getMyProfile).mockResolvedValue(mockUser)

      const store = useUserStore()
      await store.fetchCurrentUser()

      expect(usersApi.getMyProfile).toHaveBeenCalled()
      expect(store.user).toEqual(mockUser)
    })

    it('should not fetch when no token exists', async () => {
      vi.mocked(getToken).mockReturnValue(null)

      const store = useUserStore()
      await store.fetchCurrentUser()

      expect(usersApi.getMyProfile).not.toHaveBeenCalled()
    })

    it('should logout when token is expired', async () => {
      vi.mocked(getToken).mockReturnValue('expired-token')
      vi.mocked(isTokenExpired).mockReturnValue(true)

      const store = useUserStore()
      await store.fetchCurrentUser()

      expect(usersApi.getMyProfile).not.toHaveBeenCalled()
      expect(clearToken).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith({ name: 'login' })
    })

    it('should logout when fetch fails', async () => {
      vi.mocked(getToken).mockReturnValue('valid-token')
      vi.mocked(isTokenExpired).mockReturnValue(false)
      vi.mocked(usersApi.getMyProfile).mockRejectedValue(new Error('Unauthorized'))

      const store = useUserStore()
      await store.fetchCurrentUser()

      expect(clearToken).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith({ name: 'login' })
    })
  })

  describe('updateToken action', () => {
    it('should update token in store and storage', () => {
      vi.mocked(getToken).mockReturnValue('old-token')
      const store = useUserStore()

      store.updateToken('new-token')

      expect(store.token).toBe('new-token')
      expect(setToken).toHaveBeenCalledWith('new-token')
    })
  })

  describe('downloadProfileImage action', () => {
    it('should return null when user has no profile image', async () => {
      vi.mocked(getToken).mockReturnValue('token')
      const store = useUserStore()
      store.user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'USER',
        countryCode: 'AT',
        profileImageUrl: '',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const result = await store.downloadProfileImage()

      expect(result).toBeNull()
      expect(mediaApi.retrieve).not.toHaveBeenCalled()
    })

    it('should return null when user is null', async () => {
      vi.mocked(getToken).mockReturnValue('token')
      const store = useUserStore()
      store.user = null

      const result = await store.downloadProfileImage()

      expect(result).toBeNull()
    })

    it('should download and return blob URL for profile image', async () => {
      vi.mocked(getToken).mockReturnValue('token')
      const mockBlob = new Blob(['image data'], { type: 'image/png' })
      vi.mocked(mediaApi.retrieve).mockResolvedValue(mockBlob)

      // Mock URL.createObjectURL
      const mockObjectUrl = 'blob:http://localhost/12345'
      global.URL.createObjectURL = vi.fn(() => mockObjectUrl)

      const store = useUserStore()
      store.user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'USER',
        countryCode: 'AT',
        profileImageUrl: '/medias/abc-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const result = await store.downloadProfileImage()

      expect(mediaApi.retrieve).toHaveBeenCalledWith('abc-123')
      expect(result).toBe(mockObjectUrl)
    })

    it('should return null on download error', async () => {
      vi.mocked(getToken).mockReturnValue('token')
      vi.mocked(mediaApi.retrieve).mockRejectedValue(new Error('Network error'))

      const store = useUserStore()
      store.user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'USER',
        countryCode: 'AT',
        profileImageUrl: '/medias/abc-123',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      const result = await store.downloadProfileImage()

      expect(result).toBeNull()
    })
  })
})
