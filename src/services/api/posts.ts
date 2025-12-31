import { api } from './client'
import type { Page, Post, PostCreateRequest, PostUpdateRequest } from './types'

export const postsApi = {
  /**
   * Get all posts or search posts by keyword.
   * RESTful design: use query parameter to filter collection.
   * @param search Optional search keyword to filter posts
   * @param page   Zero-based page index
   * @param size   Page size
   * @param filter Filter by 'all' or 'following'
   * @param subject Optional subject/tag to filter by
   * @param authorId Optional author ID to filter by
   */
  async getAllPosts(
    search?: string,
    page = 0,
    size = 20,
    filter: 'all' | 'following' = 'all',
    subject?: string,
    authorId?: string,
  ): Promise<Page<Post>> {
    const res = await api.get<Page<Post>>('/posts', {
      params: {
        page,
        size,
        filter,
        ...(search ? { search } : {}),
        ...(subject ? { subject } : {}),
        ...(authorId ? { authorId } : {}),
      },
    })
    return res.data
  },

  /**
   * Get posts by a specific author
   */
  async getPostsByAuthor(authorId: string, page = 0, size = 20): Promise<Page<Post>> {
    return this.getAllPosts(undefined, page, size, 'all', undefined, authorId)
  },

  async getPostById(id: string): Promise<Post> {
    const res = await api.get<Post>(`/posts/${id}`)
    return res.data
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

  async likePost(id: string): Promise<void> {
    await api.post(`/posts/${id}/like`)
  },

  async unlikePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}/like`)
  },

  /**
   * Get comments for a post.
   * @param postId The parent post ID
   * @param page   Zero-based page index
   * @param size   Page size
   */
  async getComments(postId: string, page = 0, size = 20): Promise<Page<Post>> {
    const res = await api.get<Page<Post>>(`/posts/${postId}/comments`, {
      params: { page, size },
    })
    return res.data
  },

  /**
   * Create a comment on a post.
   * @param postId The parent post ID
   * @param data   Comment content (subject, content, optional imageUrl)
   */
  async createComment(postId: string, data: Omit<PostCreateRequest, 'parentId'>): Promise<Post> {
    const res = await api.post<Post>('/posts', {
      ...data,
      parentId: postId,
    })
    return res.data
  },

  /**
   * Get all unique subjects/tags used in posts.
   * Returns tags with '#' prefix.
   */
  async getSubjects(): Promise<string[]> {
    const res = await api.get<string[]>('/posts/subjects')
    return res.data
  },
}
