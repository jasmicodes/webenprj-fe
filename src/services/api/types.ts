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

/**
 * Extended user model for admin views
 * (Admin endpoints return additional fields like "active")
 */
export interface AdminUser extends User {
  active: boolean
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
  userProfileImageUrl?: string
  likeCount: number
  likedByCurrentUser: boolean
  bookmarkCount: number
  bookmarkedByCurrentUser: boolean
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

// Bookmark types

export interface BookmarkCollection {
  id: string
  name: string
  description?: string
  color?: string
  iconName?: string
  bookmarkCount: number
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: string
  post: Post
  collection: BookmarkCollection | null
  notes?: string
  createdAt: string
}

export interface BookmarkCreateRequest {
  collectionId?: string | null
  notes?: string | null
}

export interface BookmarkUpdateRequest {
  collectionId?: string | null
  notes?: string | null
}

export interface CollectionCreateRequest {
  name: string
  description?: string | null
  color?: string | null
  iconName?: string | null
}
