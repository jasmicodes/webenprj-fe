import axios, { AxiosError } from 'axios'

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

// Interceptor: JWT automatisch anhängen
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
