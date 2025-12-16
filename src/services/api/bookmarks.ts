import { api } from './client'
import type {
  Bookmark,
  BookmarkCollection,
  BookmarkCreateRequest,
  BookmarkUpdateRequest,
  CollectionCreateRequest,
  Page,
} from './types'

export const bookmarksApi = {
  // ========== Bookmark Operations ==========

  /**
   * Create a bookmark for a post (idempotent - returns existing if already bookmarked)
   * @param postId Post UUID to bookmark
   * @param data Optional collection ID and notes
   */
  async createBookmark(
    postId: string,
    data?: BookmarkCreateRequest,
  ): Promise<Bookmark> {
    const res = await api.post<Bookmark>(`/bookmarks/posts/${postId}`, data || {})
    return res.data
  },

  /**
   * Remove a bookmark from a post (idempotent)
   * @param postId Post UUID to unbookmark
   */
  async deleteBookmark(postId: string): Promise<void> {
    await api.delete(`/bookmarks/posts/${postId}`)
  },

  /**
   * Update bookmark metadata (move to collection, update notes)
   * @param postId Post UUID
   * @param data Updated collection ID and/or notes
   */
  async updateBookmark(
    postId: string,
    data: BookmarkUpdateRequest,
  ): Promise<Bookmark> {
    const res = await api.put<Bookmark>(`/bookmarks/posts/${postId}`, data)
    return res.data
  },

  /**
   * Get all bookmarks for the current user
   * @param page Zero-based page index
   * @param size Page size
   */
  async getUserBookmarks(page = 0, size = 20): Promise<Page<Bookmark>> {
    const res = await api.get<Page<Bookmark>>('/bookmarks', {
      params: { page, size },
    })
    return res.data
  },

  /**
   * Get uncategorized bookmarks (not in any collection)
   * @param page Zero-based page index
   * @param size Page size
   */
  async getUncategorizedBookmarks(page = 0, size = 20): Promise<Page<Bookmark>> {
    const res = await api.get<Page<Bookmark>>('/bookmarks/uncategorized', {
      params: { page, size },
    })
    return res.data
  },

  // ========== Collection Operations ==========

  /**
   * Create a new bookmark collection
   * @param data Collection name, description, color, and icon
   */
  async createCollection(data: CollectionCreateRequest): Promise<BookmarkCollection> {
    const res = await api.post<BookmarkCollection>('/bookmarks/collections', data)
    return res.data
  },

  /**
   * Get all collections for the current user
   */
  async getUserCollections(): Promise<BookmarkCollection[]> {
    const res = await api.get<BookmarkCollection[]>('/bookmarks/collections')
    return res.data
  },

  /**
   * Get all bookmarks within a specific collection
   * @param collectionId Collection UUID
   * @param page Zero-based page index
   * @param size Page size
   */
  async getCollectionBookmarks(
    collectionId: string,
    page = 0,
    size = 20,
  ): Promise<Page<Bookmark>> {
    const res = await api.get<Page<Bookmark>>(`/bookmarks/collections/${collectionId}`, {
      params: { page, size },
    })
    return res.data
  },

  /**
   * Update a collection's metadata
   * @param collectionId Collection UUID
   * @param data Updated name, description, color, and/or icon
   */
  async updateCollection(
    collectionId: string,
    data: CollectionCreateRequest,
  ): Promise<BookmarkCollection> {
    const res = await api.put<BookmarkCollection>(
      `/bookmarks/collections/${collectionId}`,
      data,
    )
    return res.data
  },

  /**
   * Delete a collection (bookmarks will become uncategorized)
   * @param collectionId Collection UUID
   */
  async deleteCollection(collectionId: string): Promise<void> {
    await api.delete(`/bookmarks/collections/${collectionId}`)
  },
}
