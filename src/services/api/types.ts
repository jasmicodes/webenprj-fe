export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  username: string
  countryCode: string
  profileImageUrl?: string | null
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
  userId: string
  username: string
}

export interface PostCreateRequest {
  subject: string
  content: string
  imageUrl?: string
}

export interface PostUpdateRequest {
  subject?: string
  content?: string
  imageUrl?: string
}

export interface Media {
  id: string
  contentType: string
  name: string
  // Note: externalId is intentionally excluded - internal storage detail only
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
