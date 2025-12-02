import { api } from './client'
import type { Post } from './types'

export const postsApi = {
  async getAllPosts(): Promise<Post[]> {
    const res = await api.get<Post[]>('/posts')
    return res.data
  },

  async createPost(data: { subject: string; content: string; imageUrl?: string }): Promise<Post> {
    const res = await api.post<Post>('/posts', data)
    return res.data
  },

  async updatePost(
    id: string,
    data: { subject: string; content: string; imageUrl?: string }
  ): Promise<Post> {
    const res = await api.put<Post>(`/posts/${id}`, data)
    return res.data
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`)
  },
}