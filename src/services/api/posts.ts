import { api } from './client'
import type { Page, Post, PostCreateRequest, PostUpdateRequest } from './types'

export const postsApi = {
  /**
   * Get all posts or search posts by keyword.
   * RESTful design: use query parameter to filter collection.
   * @param search Optional search keyword to filter posts
   * @param page   Zero-based page index
   * @param size   Page size
   */
  async getAllPosts(search?: string, page = 0, size = 20): Promise<Page<Post>> {
    const res = await api.get<Page<Post>>('/posts', {
      params: {
        page,
        size,
        ...(search ? { search } : {}),
      },
    })
    return res.data
  },

  async getPostById(id: string): Promise<Post> {
    const res = await api.get<Post>(`/posts/${id}`)
    return res.data
  },

  /**
   * @deprecated Use getAllPosts(search) instead for RESTful design
   * Kept for backward compatibility
   */
  async searchPosts(keyword: string, page = 0, size = 20): Promise<Page<Post>> {
    return this.getAllPosts(keyword)
  },

  async createPost(data: PostCreateRequest): Promise<Post> {
    const res = await api.post<Post>('/posts', data)
    return res.data
  },

  async updatePost(id: string, data: PostUpdateRequest): Promise<Post> {
    const res = await api.put<Post>(`/posts/${id}`, data)
    return res.data
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`)
  },
}
