<!--
  BookmarksView - Saved study posts collection

  UX polish applied:
  - Header: "Saved Posts" with subtitle for clarity
  - De-emphasized search/filters (smaller, subtle styling)
  - Reduced "New Collection" button prominence (secondary style)
  - Student-friendly messaging in empty states
  - Cards are primary visual focus, controls are secondary
  - Maintains calm, study-appropriate aesthetic throughout
-->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import SearchBar from '@/components/molecules/SearchBar.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BookmarkCard from '@/components/molecules/BookmarkCard.vue'

const bookmarkStore = useBookmarkStore()
const appearanceStore = useAppearanceStore()

const q = ref('')
const showCreateModal = ref(false)

// Ambient mode detection
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      bookmarkStore.fetchCollections(),
      bookmarkStore.fetchBookmarks(bookmarkStore.viewState.selectedCollectionId),
    ])
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
  }
})

// Handle search
function onSearch(value: string) {
  q.value = value
}

// Filter bookmarks by search query
const searchFiltered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return bookmarkStore.filteredBookmarks

  return bookmarkStore.filteredBookmarks.filter((bookmark) => {
    const post = bookmark.post
    return (
      post.content.toLowerCase().includes(term) ||
      post.username.toLowerCase().includes(term) ||
      post.subject.toLowerCase().includes(term) ||
      bookmark.notes?.toLowerCase().includes(term)
    )
  })
})

// Sort options
const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
]

// Handle collection selection
function selectCollection(collectionId: string | null) {
  bookmarkStore.setSelectedCollection(collectionId)
}

// Handle creating new collection
function openCreateModal() {
  showCreateModal.value = true
}

// Placeholder for collection creation (will be implemented with CreateCollectionModal)
function handleCreateCollection(data: any) {
  console.log('Create collection:', data)
  showCreateModal.value = false
}

// Handle bookmark removal
async function handleRemoveBookmark(postId: string) {
  try {
    await bookmarkStore.removeBookmark(postId)
    // Refresh the bookmarks list
    await bookmarkStore.fetchBookmarks(bookmarkStore.viewState.selectedCollectionId)
  } catch (error) {
    console.error('Failed to remove bookmark:', error)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center px-4 md:px-8">
    <div
      class="w-full max-w-7xl py-8 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Header (calm, study-focused) -->
      <header class="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-medium text-slate-800 tracking-tight">Saved Posts</h1>
          <p class="text-sm text-slate-500 mt-0.5">Your study material collection</p>
        </div>
        <button
          @click="openCreateModal"
          class="text-xs font-medium px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200 flex-shrink-0"
        >
          + New Collection
        </button>
      </header>

      <!-- Search & Filters (de-emphasized, below fold) -->
      <div class="mb-6 space-y-3">
        <!-- Search (smaller, less prominent) -->
        <SearchBar
          @search="onSearch"
          placeholder="Search saved posts..."
        />

        <!-- Sort (subtle) -->
        <div class="flex items-center gap-2">
          <label class="text-xs text-slate-500 font-medium">Sort:</label>
          <select
            v-model="bookmarkStore.viewState.sortBy"
            @change="bookmarkStore.setSortBy(bookmarkStore.viewState.sortBy)"
            class="px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option
              v-for="opt in sortOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Main Content: Sidebar + Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <!-- Collection sidebar (subtle, calm navigation) -->
        <aside class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-fit">
          <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Collections</h3>

          <!-- All Bookmarks -->
          <button
            @click="selectCollection(null)"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1',
              bookmarkStore.viewState.selectedCollectionId === null
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-700 hover:bg-slate-50',
            ]"
          >
            <span class="flex items-center justify-between">
              <span>All Bookmarks</span>
              <span class="text-xs text-slate-500">{{ bookmarkStore.totalBookmarkCount }}</span>
            </span>
          </button>

          <!-- Uncategorized -->
          <button
            @click="selectCollection('uncategorized')"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-2',
              bookmarkStore.viewState.selectedCollectionId === 'uncategorized'
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-slate-700 hover:bg-slate-50',
            ]"
          >
            Uncategorized
          </button>

          <!-- Collections List -->
          <div class="border-t border-slate-200 pt-2 space-y-1">
            <button
              v-for="collection in bookmarkStore.collections"
              :key="collection.id"
              @click="selectCollection(collection.id)"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                bookmarkStore.viewState.selectedCollectionId === collection.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50',
              ]"
            >
              <span class="flex items-center justify-between">
                <span
                  class="flex items-center gap-2"
                  :style="{ color: collection.color || undefined }"
                >
                  <span
                    v-if="collection.color"
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: collection.color }"
                  ></span>
                  {{ collection.name }}
                </span>
                <span class="text-xs text-slate-500">{{ collection.bookmarkCount }}</span>
              </span>
            </button>
          </div>
        </aside>

        <!-- BookmarkGrid (Placeholder - will create as component) -->
        <div>
          <!-- Loading State -->
          <div
            v-if="bookmarkStore.loading"
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center"
          >
            <p class="text-sm text-slate-500">Loading bookmarks...</p>
          </div>

          <!-- Error State -->
          <div
            v-else-if="bookmarkStore.error"
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center"
          >
            <p class="text-sm text-red-600">{{ bookmarkStore.error }}</p>
          </div>

          <!-- Empty State (calm, student-friendly messaging) -->
          <div
            v-else-if="searchFiltered.length === 0"
            class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center"
          >
            <p class="text-sm text-slate-600 mb-1">
              {{ q ? 'No saved posts match your search' : 'No saved posts yet' }}
            </p>
            <p v-if="!q" class="text-xs text-slate-500">
              Save posts from your feed to build your study collection
            </p>
          </div>

          <!-- Bookmarks Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BookmarkCard
              v-for="bookmark in searchFiltered"
              :key="bookmark.id"
              :bookmark="bookmark"
              @remove="handleRemoveBookmark"
            />
          </div>
        </div>
      </div>

      <!-- CreateCollectionModal (Placeholder - will create as component) -->
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showCreateModal = false"
      >
        <div class="bg-white rounded-2xl p-6 max-w-md w-full">
          <h2 class="text-xl font-semibold text-slate-900 mb-4">New Collection</h2>
          <p class="text-sm text-slate-600 mb-4">
            Collection creation modal will be implemented with CreateCollectionModal component.
          </p>
          <BaseButton @click="showCreateModal = false" variant="secondary" class="w-full">
            Close
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Bookmarks container
 * Clean mode: minimal styling
 * Ambient mode: premium glass panel
 */
.content-glass-container {
  /* Clean mode: very minimal */
  background: transparent;
  border-radius: 24px;
  margin-top: 16px;
  margin-bottom: 16px;
  padding-left: 24px;
  padding-right: 24px;
}

/* Ambient mode: premium glass panel */
.content-glass-container.ambient-mode {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(10px)) {
  .content-glass-container.ambient-mode {
    background: rgba(255, 255, 255, 0.85);
  }
}
</style>
