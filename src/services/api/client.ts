import axios, { AxiosError } from 'axios'
import router from '@/router'
import { API_CONFIG } from '@/data/constants'
import { getToken, clearToken, isTokenExpired } from './token'
import { useToastStore } from '@/stores/toastStore'

// Type for API error responses
type ApiErrorResponse = {
  message?: string
  error?: string
  status?: number
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_CONFIG.TIMEOUT,
})

function handleAuthFailure(message: string) {
  clearToken()
  useToastStore().showWarning(message, 'Authentication')
  const currentRoute = router.currentRoute.value
  if (currentRoute.name !== 'login') {
    router.push({ name: 'login' })
  }
}

// Request interceptor: attach JWT and fail fast on expiry
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    if (isTokenExpired(token)) {
      handleAuthFailure('Session expired. Please log in again.')
      return config
    }
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: Handle 401/403 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      handleAuthFailure('Session expired. Please log in again.')
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown): string {
  const err = error as AxiosError<ApiErrorResponse>

  if (err.response && err.response.data) {
    const data = err.response.data

    if (data.message) return data.message
    if (data.error) return data.error
  }

  if (err.message) return err.message
  return 'Unexpected error'
}
