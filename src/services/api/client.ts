import axios, { AxiosError } from 'axios'
import router from '@/router'

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
})

// Request interceptor: JWT automatisch anhängen
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
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
      // Clear authentication
      localStorage.removeItem('token')

      // Redirect to login page
      router.push({ name: 'login' })
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
