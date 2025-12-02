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
}
