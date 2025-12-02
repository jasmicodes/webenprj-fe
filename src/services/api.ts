// src/services/api.ts
import axios, { AxiosError } from 'axios'

/**
 * Axios-Instanz für alle API-Calls
 */
export const api = axios.create({
  baseURL: 'http://localhost:8081', // aus eurem Backend-Setup
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

/**
 * Hilfsfunktion für Fehler – kann später für Toasts genutzt werden
 */
export function getErrorMessage(error: unknown): string {
  const err = error as AxiosError<any>

  // Fehler-Antwort vom Backend
  if (err.response && err.response.data) {
    const data = err.response.data as {
      message?: string
      error?: string
      status?: number
    }

    if (data.message) return data.message
    if (data.error) return data.error
  }

  // Fallback
  if (err.message) return err.message
  return 'Unexpected error'
}

/* ------------------------------------------------------------------
 *  Typen aus eurem Backend
 * -----------------------------------------------------------------*/

export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  username: string
  countryCode: string
  profileImageUrl?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  countryCode: string
  profileImageUrl?: string
}

export interface UpdateProfileRequest {
  email: string
  username: string
  countryCode: string
  profileImageUrl?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface Post {
  id: string
  subject: string
  content: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  // author kommt wahrscheinlich auch dazu, kann man später ergänzen
}

/* ------------------------------------------------------------------
 *  Auth / User API-Funktionen
 * -----------------------------------------------------------------*/

export const authApi = {
  /**
   * Login: POST /auth/login
   * Request: { login, password }
   * Response: { token, user }
   */
  async login(login: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', { login, password })

    // Token in localStorage speichern (für Interceptor)
    localStorage.setItem('token', res.data.token)

    return res.data
  },

  /**
   * Registrierung: POST /users
   * Request: RegisterRequest
   * Response: User (ohne Token)
   */
  async register(payload: RegisterRequest): Promise<User> {
    const res = await api.post<User>('/users', payload)
    return res.data
  },

  /**
   * Eigener User: GET /users/me
   * Nur mit JWT möglich
   */
  async getMyProfile(): Promise<User> {
    const res = await api.get<User>('/users/me')
    return res.data
  },

  /**
   * Profil updaten: PUT /users/me
   */
  async updateMyProfile(payload: UpdateProfileRequest): Promise<User> {
    const res = await api.put<User>('/users/me', payload)
    return res.data
  },

  /**
   * Passwort ändern: PATCH /users/me/password
   */
  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await api.patch('/users/me/password', payload)
  },

  /**
   * Logout (nur Frontend-seitig)
   */
  logout() {
    localStorage.removeItem('token')
  },
}

/* ------------------------------------------------------------------
 *  Posts API
 * -----------------------------------------------------------------*/

export const postsApi = {
  /**
   * Alle Posts: GET /posts
   */
  async getAllPosts(): Promise<Post[]> {
    const res = await api.get<Post[]>('/posts')
    return res.data
  },

  /**
   * Post erstellen: POST /posts
   * userId kommt aus dem Token → FE schickt nur subject/content/imageUrl
   */
  async createPost(data: { subject: string; content: string; imageUrl?: string }): Promise<Post> {
    const res = await api.post<Post>('/posts', data)
    return res.data
  },

  /**
   * Post aktualisieren: PUT /posts/{id}
   */
  async updatePost(
    id: string,
    data: { subject: string; content: string; imageUrl?: string },
  ): Promise<Post> {
    const res = await api.put<Post>(`/posts/${id}`, data)
    return res.data
  },

  /**
   * Post löschen: DELETE /posts/{id}
   */
  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`)
  },
}

/* ------------------------------------------------------------------
 *  Admin User Management API
 * -----------------------------------------------------------------*/

export const adminApi = {
  /**
   * Alle User abrufen: GET /users
   * Nur mit ROLE_ADMIN
   */
  async getAllUsers(): Promise<User[]> {
    const res = await api.get<User[]>('/users')
    return res.data
  },

  /**
   * User bearbeiten: PUT /users/{id}
   */
  async updateUser(
    id: string,
    data: Partial<UpdateProfileRequest> & { role?: UserRole },
  ): Promise<User> {
    const res = await api.put<User>(`/users/${id}`, data)
    return res.data
  },

  /**
   * User löschen: DELETE /users/{id}
   */
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
