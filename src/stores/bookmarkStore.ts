import { defineStore } from 'pinia'
import { bookmarksApi } from '@/services/api/bookmarks'
import { logger } from '@/services/logger'
import type {
  Bookmark,
  BookmarkCollection,
  BookmarkCreateRequest,
  CollectionCreateRequest,
} from '@/services/api/types'

interface ViewState {
  selectedCollectionId: string | null // null = "All Bookmarks", "uncategorized" = special filter
  sortBy: 'newest' | 'oldest'
  selectedTags: string[]
}

const STORAGE_KEY = 'bookmarks_view_state'

// Load initial view state from localStorage
function loadViewState(): ViewState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    logger.error('Failed to load bookmark view state from localStorage:', error)
  }

  // Default view state
  return {
    selectedCollectionId: null,
    sortBy: 'newest',
    selectedTags: [],
  }
}

// Save view state to localStorage
function saveViewState(state: ViewState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    logger.error('Failed to save bookmark view state to localStorage:', error)
  }
}

export const useBookmarkStore = defineStore('bookmarks', {
  state: () => ({
    collections: [] as BookmarkCollection[],
    bookmarks: [] as Bookmark[],
    viewState: loadViewState(),
    loading: false,
    error: null as string | null,
  }),

  getters: {
    /**
     * Get the currently selected collection
     */
    selectedCollection: (state): BookmarkCollection | null => {
      if (!state.viewState.selectedCollectionId) return null
      return state.collections.find((c) => c.id === state.viewState.selectedCollectionId) || null
    },

    /**
     * Total count of all bookmarks across all collections
     */
    totalBookmarkCount: (state): number => {
      return state.collections.reduce((sum, c) => sum + c.bookmarkCount, 0)
    },

    /**
     * Filter and sort bookmarks based on current view state
     */
    filteredBookmarks: (state): Bookmark[] => {
      let filtered = [...state.bookmarks]

      // Filter by selected tags (post subject must include ALL selected tags)
      if (state.viewState.selectedTags.length > 0) {
        filtered = filtered.filter((bookmark) => {
          const subject = bookmark.post.subject.toLowerCase()
          return state.viewState.selectedTags.every((tag) =>
            subject.includes(tag.toLowerCase()),
          )
        })
      }

      // Sort bookmarks
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return state.viewState.sortBy === 'newest' ? dateB - dateA : dateA - dateB
      })

      return filtered
    },
  },

  actions: {
    // ========== Collections ==========

    async fetchCollections() {
      if (this.loading) return // Prevent duplicate requests
      try {
        this.loading = true
        this.error = null
        this.collections = await bookmarksApi.getUserCollections()
      } catch (err) {
        this.error = 'Failed to fetch collections'
        logger.error('Error fetching collections:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async createCollection(data: CollectionCreateRequest) {
      try {
        this.loading = true
        this.error = null
        const newCollection = await bookmarksApi.createCollection(data)
        this.collections.push(newCollection)
        return newCollection
      } catch (err) {
        this.error = 'Failed to create collection'
        logger.error('Error creating collection:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateCollection(collectionId: string, data: CollectionCreateRequest) {
      try {
        this.loading = true
        this.error = null
        const updated = await bookmarksApi.updateCollection(collectionId, data)
        const index = this.collections.findIndex((c) => c.id === collectionId)
        if (index !== -1) {
          this.collections[index] = updated
        }
        return updated
      } catch (err) {
        this.error = 'Failed to update collection'
        logger.error('Error updating collection:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteCollection(collectionId: string) {
      try {
        this.loading = true
        this.error = null
        await bookmarksApi.deleteCollection(collectionId)
        this.collections = this.collections.filter((c) => c.id !== collectionId)

        // If deleted collection was selected, switch to "All Bookmarks"
        if (this.viewState.selectedCollectionId === collectionId) {
          this.setSelectedCollection(null)
        }
      } catch (err) {
        this.error = 'Failed to delete collection'
        logger.error('Error deleting collection:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // ========== Bookmarks ==========

    async fetchBookmarks(collectionId?: string | null, page = 0, size = 20) {
      try {
        this.loading = true
        this.error = null

        let result
        if (collectionId === 'uncategorized') {
          result = await bookmarksApi.getUncategorizedBookmarks(page, size)
        } else if (collectionId) {
          result = await bookmarksApi.getCollectionBookmarks(collectionId, page, size)
        } else {
          result = await bookmarksApi.getUserBookmarks(page, size)
        }

        this.bookmarks = result.content
        return result
      } catch (err) {
        this.error = 'Failed to fetch bookmarks'
        logger.error('Error fetching bookmarks:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async addBookmark(postId: string, data?: BookmarkCreateRequest) {
      try {
        this.loading = true
        this.error = null
        const bookmark = await bookmarksApi.createBookmark(postId, data)

        // Add to local bookmarks if not already present
        if (!this.bookmarks.find((b) => b.id === bookmark.id)) {
          this.bookmarks.unshift(bookmark)
        }

        // Update collection bookmark count
        if (bookmark.collection) {
          const collection = this.collections.find((c) => c.id === bookmark.collection!.id)
          if (collection) {
            collection.bookmarkCount++
          }
        }

        return bookmark
      } catch (err) {
        this.error = 'Failed to add bookmark'
        logger.error('Error adding bookmark:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async removeBookmark(postId: string) {
      try {
        this.loading = true
        this.error = null

        // Find the bookmark to get its collection before deleting
        const bookmark = this.bookmarks.find((b) => b.post.id === postId)

        await bookmarksApi.deleteBookmark(postId)

        // Remove from local bookmarks
        this.bookmarks = this.bookmarks.filter((b) => b.post.id !== postId)

        // Update collection bookmark count
        if (bookmark?.collection) {
          const collection = this.collections.find((c) => c.id === bookmark.collection!.id)
          if (collection && collection.bookmarkCount > 0) {
            collection.bookmarkCount--
          }
        }
      } catch (err) {
        this.error = 'Failed to remove bookmark'
        logger.error('Error removing bookmark:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async moveToCollection(postId: string, collectionId: string | null) {
      try {
        this.loading = true
        this.error = null

        const updated = await bookmarksApi.updateBookmark(postId, { collectionId })

        // Update in local bookmarks
        const index = this.bookmarks.findIndex((b) => b.post.id === postId)
        if (index !== -1) {
          this.bookmarks[index] = updated
        }

        return updated
      } catch (err) {
        this.error = 'Failed to move bookmark'
        logger.error('Error moving bookmark:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateBookmarkNotes(postId: string, notes: string | null) {
      try {
        this.loading = true
        this.error = null

        const bookmark = this.bookmarks.find((b) => b.post.id === postId)
        if (!bookmark) {
          throw new Error('Bookmark not found')
        }

        const updated = await bookmarksApi.updateBookmark(postId, {
          collectionId: bookmark.collection?.id || null,
          notes,
        })

        // Update in local bookmarks
        const index = this.bookmarks.findIndex((b) => b.post.id === postId)
        if (index !== -1) {
          this.bookmarks[index] = updated
        }

        return updated
      } catch (err) {
        this.error = 'Failed to update bookmark notes'
        logger.error('Error updating bookmark notes:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // ========== View State Management ==========

    setSelectedCollection(collectionId: string | null) {
      this.viewState.selectedCollectionId = collectionId
      saveViewState(this.viewState)

      // Fetch bookmarks for the selected collection
      this.fetchBookmarks(collectionId)
    },

    setSortBy(sortBy: 'newest' | 'oldest') {
      this.viewState.sortBy = sortBy
      saveViewState(this.viewState)
    },

    setSelectedTags(tags: string[]) {
      this.viewState.selectedTags = tags
      saveViewState(this.viewState)
    },

    toggleTag(tag: string) {
      const index = this.viewState.selectedTags.indexOf(tag)
      if (index !== -1) {
        this.viewState.selectedTags.splice(index, 1)
      } else {
        this.viewState.selectedTags.push(tag)
      }
      saveViewState(this.viewState)
    },

    clearFilters() {
      this.viewState.selectedTags = []
      saveViewState(this.viewState)
    },
  },
})
