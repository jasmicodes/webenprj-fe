import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookmarkStore } from './bookmarkStore'

// Mock the API module
vi.mock('@/services/api/bookmarks', () => ({
  bookmarksApi: {
    getUserCollections: vi.fn(),
    createCollection: vi.fn(),
    updateCollection: vi.fn(),
    deleteCollection: vi.fn(),
    getUserBookmarks: vi.fn(),
    getCollectionBookmarks: vi.fn(),
    getUncategorizedBookmarks: vi.fn(),
    createBookmark: vi.fn(),
    deleteBookmark: vi.fn(),
    updateBookmark: vi.fn(),
  },
}))

import { bookmarksApi } from '@/services/api/bookmarks'

describe('bookmarkStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const store = useBookmarkStore()

      expect(store.collections).toEqual([])
      expect(store.bookmarks).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.viewState.selectedCollectionId).toBeNull()
      expect(store.viewState.sortBy).toBe('newest')
      expect(store.viewState.selectedTags).toEqual([])
    })

    it('should load view state from localStorage', () => {
      const savedState = {
        selectedCollectionId: 'collection-123',
        sortBy: 'oldest',
        selectedTags: ['webdev'],
      }
      localStorage.setItem('bookmarks_view_state', JSON.stringify(savedState))

      const store = useBookmarkStore()

      expect(store.viewState.selectedCollectionId).toBe('collection-123')
      expect(store.viewState.sortBy).toBe('oldest')
      expect(store.viewState.selectedTags).toEqual(['webdev'])
    })
  })

  describe('getters', () => {
    it('selectedCollection should return null when no collection selected', () => {
      const store = useBookmarkStore()
      store.viewState.selectedCollectionId = null

      expect(store.selectedCollection).toBeNull()
    })

    it('selectedCollection should return the selected collection', () => {
      const store = useBookmarkStore()
      store.collections = [
        { id: 'col-1', name: 'Collection 1', bookmarkCount: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01', color: '#FF0000', iconName: 'bookmark' },
        { id: 'col-2', name: 'Collection 2', bookmarkCount: 3, createdAt: '2024-01-02', updatedAt: '2024-01-02', color: '#00FF00', iconName: 'star' },
      ]
      store.viewState.selectedCollectionId = 'col-2'

      expect(store.selectedCollection?.name).toBe('Collection 2')
    })

    it('totalBookmarkCount should sum all collection counts', () => {
      const store = useBookmarkStore()
      store.collections = [
        { id: 'col-1', name: 'Collection 1', bookmarkCount: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01', color: '#FF0000', iconName: 'bookmark' },
        { id: 'col-2', name: 'Collection 2', bookmarkCount: 3, createdAt: '2024-01-02', updatedAt: '2024-01-02', color: '#00FF00', iconName: 'star' },
        { id: 'col-3', name: 'Collection 3', bookmarkCount: 7, createdAt: '2024-01-03', updatedAt: '2024-01-03', color: '#0000FF', iconName: 'heart' },
      ]

      expect(store.totalBookmarkCount).toBe(15)
    })

    it('filteredBookmarks should filter by selected tags', () => {
      const store = useBookmarkStore()
      store.bookmarks = [
        { id: 'b1', post: { id: 'p1', subject: '#webdev #javascript' }, createdAt: '2024-01-01' },
        { id: 'b2', post: { id: 'p2', subject: '#webdev #python' }, createdAt: '2024-01-02' },
        { id: 'b3', post: { id: 'p3', subject: '#mobile #swift' }, createdAt: '2024-01-03' },
      ] as unknown as typeof store.bookmarks

      store.viewState.selectedTags = ['webdev']

      expect(store.filteredBookmarks.length).toBe(2)
      expect(store.filteredBookmarks.map((b) => b.id)).toContain('b1')
      expect(store.filteredBookmarks.map((b) => b.id)).toContain('b2')
    })

    it('filteredBookmarks should sort by newest first', () => {
      const store = useBookmarkStore()
      store.bookmarks = [
        { id: 'b1', post: { id: 'p1', subject: '#test' }, createdAt: '2024-01-01T00:00:00Z' },
        { id: 'b2', post: { id: 'p2', subject: '#test' }, createdAt: '2024-01-03T00:00:00Z' },
        { id: 'b3', post: { id: 'p3', subject: '#test' }, createdAt: '2024-01-02T00:00:00Z' },
      ] as unknown as typeof store.bookmarks

      store.viewState.sortBy = 'newest'

      expect(store.filteredBookmarks[0]!.id).toBe('b2')
      expect(store.filteredBookmarks[1]!.id).toBe('b3')
      expect(store.filteredBookmarks[2]!.id).toBe('b1')
    })

    it('filteredBookmarks should sort by oldest first', () => {
      const store = useBookmarkStore()
      store.bookmarks = [
        { id: 'b1', post: { id: 'p1', subject: '#test' }, createdAt: '2024-01-01T00:00:00Z' },
        { id: 'b2', post: { id: 'p2', subject: '#test' }, createdAt: '2024-01-03T00:00:00Z' },
        { id: 'b3', post: { id: 'p3', subject: '#test' }, createdAt: '2024-01-02T00:00:00Z' },
      ] as unknown as typeof store.bookmarks

      store.viewState.sortBy = 'oldest'

      expect(store.filteredBookmarks[0]!.id).toBe('b1')
      expect(store.filteredBookmarks[1]!.id).toBe('b3')
      expect(store.filteredBookmarks[2]!.id).toBe('b2')
    })
  })

  describe('collection actions', () => {
    it('fetchCollections should load collections from API', async () => {
      const mockCollections = [
        { id: 'col-1', name: 'My Collection', bookmarkCount: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01', color: '#FF0000', iconName: 'bookmark' },
      ]
      vi.mocked(bookmarksApi.getUserCollections).mockResolvedValue(mockCollections)

      const store = useBookmarkStore()
      await store.fetchCollections()

      expect(bookmarksApi.getUserCollections).toHaveBeenCalled()
      expect(store.collections).toEqual(mockCollections)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('fetchCollections should set error on failure', async () => {
      vi.mocked(bookmarksApi.getUserCollections).mockRejectedValue(new Error('Network error'))

      const store = useBookmarkStore()

      await expect(store.fetchCollections()).rejects.toThrow()
      expect(store.error).toBe('Failed to fetch collections')
      expect(store.loading).toBe(false)
    })

    it('createCollection should add new collection', async () => {
      const newCollection = { id: 'new-col', name: 'New Collection', bookmarkCount: 0, createdAt: '2024-01-01', updatedAt: '2024-01-01', color: '#FF0000', iconName: 'bookmark' }
      vi.mocked(bookmarksApi.createCollection).mockResolvedValue(newCollection)

      const store = useBookmarkStore()
      const result = await store.createCollection({ name: 'New Collection', color: '#FF0000', iconName: 'bookmark' })

      expect(bookmarksApi.createCollection).toHaveBeenCalledWith({ name: 'New Collection', color: '#FF0000', iconName: 'bookmark' })
      expect(store.collections).toContainEqual(newCollection)
      expect(result).toEqual(newCollection)
    })

    it('updateCollection should update existing collection', async () => {
      const store = useBookmarkStore()
      store.collections = [
        { id: 'col-1', name: 'Old Name', bookmarkCount: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01', color: '#FF0000', iconName: 'bookmark' },
      ]

      const updatedCollection = { id: 'col-1', name: 'New Name', bookmarkCount: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01', color: '#00FF00', iconName: 'star' }
      vi.mocked(bookmarksApi.updateCollection).mockResolvedValue(updatedCollection)

      await store.updateCollection('col-1', { name: 'New Name', color: '#00FF00', iconName: 'star' })

      expect(store.collections[0]!.name).toBe('New Name')
      expect(store.collections[0]!.color).toBe('#00FF00')
    })

    it('deleteCollection should remove collection and reset selection', async () => {
      vi.mocked(bookmarksApi.deleteCollection).mockResolvedValue(undefined)
      vi.mocked(bookmarksApi.getUserBookmarks).mockResolvedValue({ content: [], totalPages: 0, totalElements: 0, size: 20, number: 0 })

      const store = useBookmarkStore()
      store.collections = [
        { id: 'col-1', name: 'Collection 1', bookmarkCount: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01', color: '#FF0000', iconName: 'bookmark' },
        { id: 'col-2', name: 'Collection 2', bookmarkCount: 3, createdAt: '2024-01-02', updatedAt: '2024-01-02', color: '#00FF00', iconName: 'star' },
      ]
      store.viewState.selectedCollectionId = 'col-1'

      await store.deleteCollection('col-1')

      expect(bookmarksApi.deleteCollection).toHaveBeenCalledWith('col-1')
      expect(store.collections.length).toBe(1)
      expect(store.collections[0]!.id).toBe('col-2')
      expect(store.viewState.selectedCollectionId).toBeNull()
    })
  })

  describe('bookmark actions', () => {
    it('fetchBookmarks should load all bookmarks when no collection specified', async () => {
      const mockBookmarks = { content: [{ id: 'b1', post: { id: 'p1' } }], totalPages: 1, totalElements: 1, size: 20, number: 0 }
      vi.mocked(bookmarksApi.getUserBookmarks).mockResolvedValue(mockBookmarks as unknown as Awaited<ReturnType<typeof bookmarksApi.getUserBookmarks>>)

      const store = useBookmarkStore()
      await store.fetchBookmarks(null)

      expect(bookmarksApi.getUserBookmarks).toHaveBeenCalledWith(0, 20)
      expect(store.bookmarks).toEqual(mockBookmarks.content)
    })

    it('fetchBookmarks should load collection bookmarks when collection specified', async () => {
      const mockBookmarks = { content: [{ id: 'b1', post: { id: 'p1' } }], totalPages: 1, totalElements: 1, size: 20, number: 0 }
      vi.mocked(bookmarksApi.getCollectionBookmarks).mockResolvedValue(mockBookmarks as unknown as Awaited<ReturnType<typeof bookmarksApi.getCollectionBookmarks>>)

      const store = useBookmarkStore()
      await store.fetchBookmarks('col-123')

      expect(bookmarksApi.getCollectionBookmarks).toHaveBeenCalledWith('col-123', 0, 20)
    })

    it('fetchBookmarks should load uncategorized when specified', async () => {
      const mockBookmarks = { content: [{ id: 'b1', post: { id: 'p1' } }], totalPages: 1, totalElements: 1, size: 20, number: 0 }
      vi.mocked(bookmarksApi.getUncategorizedBookmarks).mockResolvedValue(mockBookmarks as unknown as Awaited<ReturnType<typeof bookmarksApi.getUncategorizedBookmarks>>)

      const store = useBookmarkStore()
      await store.fetchBookmarks('uncategorized')

      expect(bookmarksApi.getUncategorizedBookmarks).toHaveBeenCalledWith(0, 20)
    })

    it('addBookmark should add new bookmark and update collection count', async () => {
      const newBookmark = {
        id: 'new-b',
        post: { id: 'post-123' },
        collection: { id: 'col-1' },
        createdAt: '2024-01-01',
      }
      vi.mocked(bookmarksApi.createBookmark).mockResolvedValue(newBookmark as unknown as Awaited<ReturnType<typeof bookmarksApi.createBookmark>>)

      const store = useBookmarkStore()
      store.collections = [
        { id: 'col-1', name: 'Collection 1', bookmarkCount: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01', color: '#FF0000', iconName: 'bookmark' },
      ]

      await store.addBookmark('post-123', { collectionId: 'col-1' })

      expect(store.bookmarks[0]).toEqual(newBookmark)
      expect(store.collections[0]!.bookmarkCount).toBe(6)
    })

    it('removeBookmark should remove bookmark and update collection count', async () => {
      vi.mocked(bookmarksApi.deleteBookmark).mockResolvedValue(undefined)

      const store = useBookmarkStore()
      store.bookmarks = [
        { id: 'b1', post: { id: 'p1' }, collection: { id: 'col-1' }, createdAt: '2024-01-01' },
        { id: 'b2', post: { id: 'p2' }, collection: null, createdAt: '2024-01-02' },
      ] as unknown as typeof store.bookmarks
      store.collections = [
        { id: 'col-1', name: 'Collection 1', bookmarkCount: 5, createdAt: '2024-01-01', updatedAt: '2024-01-01', color: '#FF0000', iconName: 'bookmark' },
      ]

      await store.removeBookmark('p1')

      expect(bookmarksApi.deleteBookmark).toHaveBeenCalledWith('p1')
      expect(store.bookmarks.length).toBe(1)
      expect(store.bookmarks[0]!.id).toBe('b2')
      expect(store.collections[0]!.bookmarkCount).toBe(4)
    })

    it('moveToCollection should update bookmark collection', async () => {
      const updatedBookmark = { id: 'b1', post: { id: 'p1' }, collection: { id: 'col-2' }, createdAt: '2024-01-01' }
      vi.mocked(bookmarksApi.updateBookmark).mockResolvedValue(updatedBookmark as unknown as Awaited<ReturnType<typeof bookmarksApi.updateBookmark>>)

      const store = useBookmarkStore()
      store.bookmarks = [
        { id: 'b1', post: { id: 'p1' }, collection: { id: 'col-1' }, createdAt: '2024-01-01' },
      ] as unknown as typeof store.bookmarks

      await store.moveToCollection('p1', 'col-2')

      expect(bookmarksApi.updateBookmark).toHaveBeenCalledWith('p1', { collectionId: 'col-2' })
      expect(store.bookmarks[0]!.collection?.id).toBe('col-2')
    })

    it('updateBookmarkNotes should update bookmark notes', async () => {
      const updatedBookmark = { id: 'b1', post: { id: 'p1' }, collection: { id: 'col-1' }, notes: 'Updated notes', createdAt: '2024-01-01' }
      vi.mocked(bookmarksApi.updateBookmark).mockResolvedValue(updatedBookmark as unknown as Awaited<ReturnType<typeof bookmarksApi.updateBookmark>>)

      const store = useBookmarkStore()
      store.bookmarks = [
        { id: 'b1', post: { id: 'p1' }, collection: { id: 'col-1' }, notes: 'Old notes', createdAt: '2024-01-01' },
      ] as unknown as typeof store.bookmarks

      await store.updateBookmarkNotes('p1', 'Updated notes')

      expect(store.bookmarks[0]!.notes).toBe('Updated notes')
    })

    it('updateBookmarkNotes should throw error when bookmark not found', async () => {
      const store = useBookmarkStore()
      store.bookmarks = []

      await expect(store.updateBookmarkNotes('nonexistent', 'Notes')).rejects.toThrow('Bookmark not found')
    })
  })

  describe('view state actions', () => {
    it('setSelectedCollection should update selection and persist', async () => {
      vi.mocked(bookmarksApi.getUserBookmarks).mockResolvedValue({ content: [], totalPages: 0, totalElements: 0, size: 20, number: 0 })

      const store = useBookmarkStore()
      store.setSelectedCollection('col-123')

      expect(store.viewState.selectedCollectionId).toBe('col-123')

      const stored = JSON.parse(localStorage.getItem('bookmarks_view_state') || '{}')
      expect(stored.selectedCollectionId).toBe('col-123')
    })

    it('setSortBy should update sort and persist', () => {
      const store = useBookmarkStore()
      store.setSortBy('oldest')

      expect(store.viewState.sortBy).toBe('oldest')

      const stored = JSON.parse(localStorage.getItem('bookmarks_view_state') || '{}')
      expect(stored.sortBy).toBe('oldest')
    })

    it('setSelectedTags should update tags and persist', () => {
      const store = useBookmarkStore()
      store.setSelectedTags(['webdev', 'javascript'])

      expect(store.viewState.selectedTags).toEqual(['webdev', 'javascript'])

      const stored = JSON.parse(localStorage.getItem('bookmarks_view_state') || '{}')
      expect(stored.selectedTags).toEqual(['webdev', 'javascript'])
    })

    it('toggleTag should add tag when not present', () => {
      const store = useBookmarkStore()
      store.viewState.selectedTags = ['existing']

      store.toggleTag('newTag')

      expect(store.viewState.selectedTags).toContain('newTag')
      expect(store.viewState.selectedTags).toContain('existing')
    })

    it('toggleTag should remove tag when present', () => {
      const store = useBookmarkStore()
      store.viewState.selectedTags = ['tag1', 'tag2']

      store.toggleTag('tag1')

      expect(store.viewState.selectedTags).not.toContain('tag1')
      expect(store.viewState.selectedTags).toContain('tag2')
    })

    it('clearFilters should reset tags', () => {
      const store = useBookmarkStore()
      store.viewState.selectedTags = ['tag1', 'tag2']

      store.clearFilters()

      expect(store.viewState.selectedTags).toEqual([])
    })
  })
})
