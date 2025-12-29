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
defineOptions({ name: 'BookmarksView' })

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useBookmarkStore } from '@/stores/bookmarkStore'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BookmarkListItem from '@/components/molecules/BookmarkListItem.vue'

const bookmarkStore = useBookmarkStore()
const appearanceStore = useAppearanceStore()

// Search state with debouncing
const searchInput = ref('')
const searchQuery = ref('')
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const showCreateModal = ref(false)

// Bulk select state
const selectMode = ref(false)
const selectedIds = ref<Set<string>>(new Set())
const lastSelectedIndex = ref<number | null>(null)
const showBulkRemoveModal = ref(false)
const showMoveDropdown = ref(false)
const bulkActionLoading = ref(false)

// Responsive detection
const isMobile = useMediaQuery('(max-width: 1023px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// Mobile collection dropdown state
const showCollectionDropdown = ref(false)

// Get selected collection label for mobile dropdown
const selectedCollectionLabel = computed(() => {
  const id = bookmarkStore.viewState.selectedCollectionId
  if (id === null) return 'All Bookmarks'
  if (id === 'uncategorized') return 'Uncategorized'
  const collection = bookmarkStore.collections.find(c => c.id === id)
  return collection?.name || 'All Bookmarks'
})

// Get uncategorized count (total - sum of collection counts)
const uncategorizedCount = computed(() => {
  const collectionTotal = bookmarkStore.collections.reduce((sum, c) => sum + c.bookmarkCount, 0)
  return Math.max(0, bookmarkStore.totalBookmarkCount - collectionTotal)
})

// Load data on mount
onMounted(async () => {
  await Promise.all([
    bookmarkStore.fetchCollections(),
    bookmarkStore.fetchBookmarks(bookmarkStore.viewState.selectedCollectionId),
  ])
})

// Cleanup debounce timer on unmount
onUnmounted(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})

// Debounced search: update searchQuery after 300ms of no typing
watch(searchInput, (newValue) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
  searchDebounceTimer = setTimeout(() => {
    searchQuery.value = newValue
  }, 300)
})

// Filter bookmarks by search query (searches title/content, author, tags)
const searchFiltered = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
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

// Results counter
const totalCount = computed(() => bookmarkStore.filteredBookmarks.length)
const filteredCount = computed(() => searchFiltered.value.length)

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
function handleCreateCollection(_data: unknown) {
  // TODO: Implement with CreateCollectionModal component
  showCreateModal.value = false
}

// Handle bookmark removal
async function handleRemoveBookmark(postId: string) {
  await bookmarkStore.removeBookmark(postId)
  // Refresh the bookmarks list
  await bookmarkStore.fetchBookmarks(bookmarkStore.viewState.selectedCollectionId)
}

// ========== Bulk Select Functions ==========

// Enter/exit select mode
function toggleSelectMode() {
  selectMode.value = !selectMode.value
  if (!selectMode.value) {
    // Clear selections when exiting
    selectedIds.value.clear()
    lastSelectedIndex.value = null
    showMoveDropdown.value = false
  }
}

// Cancel select mode
function cancelSelectMode() {
  selectMode.value = false
  selectedIds.value.clear()
  lastSelectedIndex.value = null
  showMoveDropdown.value = false
}

// Count of selected items
const selectedCount = computed(() => selectedIds.value.size)

// Toggle selection of a single bookmark (with shift-click support)
function handleSelect(postId: string, index: number, event: MouseEvent) {
  if (!selectMode.value) return

  const newSelected = new Set(selectedIds.value)

  if (event.shiftKey && lastSelectedIndex.value !== null) {
    // Range selection
    const start = Math.min(lastSelectedIndex.value, index)
    const end = Math.max(lastSelectedIndex.value, index)
    const items = searchFiltered.value.slice(start, end + 1)
    items.forEach(b => newSelected.add(b.post.id))
  } else {
    // Toggle single selection
    if (newSelected.has(postId)) {
      newSelected.delete(postId)
    } else {
      newSelected.add(postId)
    }
    lastSelectedIndex.value = index
  }

  selectedIds.value = newSelected
}

// Check if a bookmark is selected
function isSelected(postId: string): boolean {
  return selectedIds.value.has(postId)
}

// Select all visible bookmarks
function selectAll() {
  const newSelected = new Set(selectedIds.value)
  searchFiltered.value.forEach(b => newSelected.add(b.post.id))
  selectedIds.value = newSelected
}

// Deselect all
function deselectAll() {
  selectedIds.value.clear()
}

// Open bulk remove confirmation
function openBulkRemoveModal() {
  showBulkRemoveModal.value = true
}

// Confirm bulk remove
async function confirmBulkRemove() {
  bulkActionLoading.value = true
  try {
    const idsToRemove = Array.from(selectedIds.value)
    for (const postId of idsToRemove) {
      await bookmarkStore.removeBookmark(postId)
    }
    // Refresh and exit select mode
    await bookmarkStore.fetchBookmarks(bookmarkStore.viewState.selectedCollectionId)
    cancelSelectMode()
  } finally {
    bulkActionLoading.value = false
    showBulkRemoveModal.value = false
  }
}

// Move selected bookmarks to a collection
async function bulkMoveToCollection(collectionId: string | null) {
  bulkActionLoading.value = true
  try {
    const idsToMove = Array.from(selectedIds.value)
    for (const postId of idsToMove) {
      await bookmarkStore.moveToCollection(postId, collectionId)
    }
    // Refresh and exit select mode
    await bookmarkStore.fetchBookmarks(bookmarkStore.viewState.selectedCollectionId)
    showMoveDropdown.value = false
    cancelSelectMode()
  } finally {
    bulkActionLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen px-3 md:px-6">
    <div
      class="w-full max-w-7xl mx-auto py-3 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Two-column layout -->
      <div class="flex gap-4">
        <!-- Left: Collections Sidebar (desktop only) -->
        <aside
          class="hidden lg:flex flex-col w-52 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <!-- Sidebar Header -->
          <div class="p-3 border-b border-slate-100">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-sm font-semibold text-slate-800">Collections</h2>
            </div>
            <button
              @click="openCreateModal"
              class="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Collection
            </button>
          </div>

          <!-- Sidebar Content (scrollable) -->
          <div class="flex-1 overflow-y-auto p-2 space-y-0.5">
            <!-- All Bookmarks -->
            <button
              @click="selectCollection(null)"
              :class="[
                'w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors',
                bookmarkStore.viewState.selectedCollectionId === null
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50',
              ]"
            >
              <span class="flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                  All Bookmarks
                </span>
                <span class="text-xs text-slate-400 font-normal">{{ bookmarkStore.totalBookmarkCount }}</span>
              </span>
            </button>

            <!-- Uncategorized -->
            <button
              @click="selectCollection('uncategorized')"
              :class="[
                'w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors',
                bookmarkStore.viewState.selectedCollectionId === 'uncategorized'
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50',
              ]"
            >
              <span class="flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  Uncategorized
                </span>
                <span class="text-xs text-slate-400 font-normal">{{ uncategorizedCount }}</span>
              </span>
            </button>

            <!-- Divider -->
            <div v-if="bookmarkStore.collections.length > 0" class="border-t border-slate-100 my-1.5"></div>

            <!-- User Collections -->
            <button
              v-for="collection in bookmarkStore.collections"
              :key="collection.id"
              @click="selectCollection(collection.id)"
              :class="[
                'w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors',
                bookmarkStore.viewState.selectedCollectionId === collection.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50',
              ]"
            >
              <span class="flex items-center justify-between">
                <span class="flex items-center gap-2 truncate">
                  <span
                    class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: collection.color || '#94a3b8' }"
                  ></span>
                  <span class="truncate">{{ collection.name }}</span>
                </span>
                <span class="text-xs text-slate-400 font-normal ml-2">{{ collection.bookmarkCount }}</span>
              </span>
            </button>

            <!-- Empty collections placeholder -->
            <div
              v-if="bookmarkStore.collections.length === 0"
              class="px-2.5 py-4 text-center"
            >
              <p class="text-xs text-slate-400">No collections yet</p>
            </div>
          </div>
        </aside>

        <!-- Right: Main Content -->
        <div class="flex-1 min-w-0">
          <!-- Mobile Collection Dropdown -->
          <div class="lg:hidden mb-3 relative">
            <button
              @click="showCollectionDropdown = !showCollectionDropdown"
              class="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"
            >
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
                {{ selectedCollectionLabel }}
              </span>
              <svg
                class="w-4 h-4 text-slate-400 transition-transform"
                :class="{ 'rotate-180': showCollectionDropdown }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <!-- Mobile Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="showCollectionDropdown"
                class="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-64 overflow-y-auto"
              >
                <button
                  @click="selectCollection(null); showCollectionDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                  :class="bookmarkStore.viewState.selectedCollectionId === null ? 'text-blue-600 font-medium' : 'text-slate-700'"
                >
                  <span>All Bookmarks</span>
                  <span class="text-xs text-slate-400">{{ bookmarkStore.totalBookmarkCount }}</span>
                </button>
                <button
                  @click="selectCollection('uncategorized'); showCollectionDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                  :class="bookmarkStore.viewState.selectedCollectionId === 'uncategorized' ? 'text-blue-600 font-medium' : 'text-slate-700'"
                >
                  <span>Uncategorized</span>
                  <span class="text-xs text-slate-400">{{ uncategorizedCount }}</span>
                </button>
                <div v-if="bookmarkStore.collections.length > 0" class="border-t border-slate-100 my-1"></div>
                <button
                  v-for="collection in bookmarkStore.collections"
                  :key="collection.id"
                  @click="selectCollection(collection.id); showCollectionDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                  :class="bookmarkStore.viewState.selectedCollectionId === collection.id ? 'text-blue-600 font-medium' : 'text-slate-700'"
                >
                  <span class="flex items-center gap-2">
                    <span
                      class="w-2 h-2 rounded-full"
                      :style="{ backgroundColor: collection.color || '#94a3b8' }"
                    ></span>
                    {{ collection.name }}
                  </span>
                  <span class="text-xs text-slate-400">{{ collection.bookmarkCount }}</span>
                </button>
                <div class="border-t border-slate-100 my-1"></div>
                <button
                  @click="openCreateModal(); showCollectionDropdown = false"
                  class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New Collection
                </button>
              </div>
            </Transition>
          </div>

          <!-- Toolbar -->
          <div class="flex items-center gap-2 mb-3">
            <!-- Normal Mode Toolbar -->
            <template v-if="!selectMode">
              <!-- Search input -->
              <div class="relative flex-1">
                <svg
                  class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  v-model="searchInput"
                  type="text"
                  placeholder="Search bookmarks..."
                  class="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              <!-- Sort dropdown -->
              <select
                v-model="bookmarkStore.viewState.sortBy"
                @change="bookmarkStore.setSortBy(bookmarkStore.viewState.sortBy)"
                class="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white cursor-pointer"
              >
                <option
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>

              <!-- Select button -->
              <button
                v-if="searchFiltered.length > 0"
                type="button"
                class="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                @click="toggleSelectMode"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select
              </button>
            </template>

            <!-- Select Mode Toolbar -->
            <template v-else>
              <!-- Selection count -->
              <div class="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  title="Select all"
                  @click="selectAll"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <span class="text-sm text-slate-700">
                  <span class="font-medium">{{ selectedCount }}</span> selected
                </span>
              </div>

              <!-- Bulk Actions -->
              <div class="flex items-center gap-1.5">
                <!-- Move to collection dropdown -->
                <div class="relative">
                  <button
                    type="button"
                    class="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                    :disabled="selectedCount === 0"
                    :class="{ 'opacity-50 cursor-not-allowed': selectedCount === 0 }"
                    @click="showMoveDropdown = !showMoveDropdown"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    Move
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <!-- Move dropdown -->
                  <Transition
                    enter-active-class="transition ease-out duration-100"
                    enter-from-class="opacity-0 scale-95"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition ease-in duration-75"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <div
                      v-if="showMoveDropdown"
                      class="absolute z-30 top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto"
                    >
                      <button
                        class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        @click="bulkMoveToCollection(null)"
                      >
                        Uncategorized
                      </button>
                      <div v-if="bookmarkStore.collections.length > 0" class="border-t border-slate-100 my-1"></div>
                      <button
                        v-for="collection in bookmarkStore.collections"
                        :key="collection.id"
                        class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        @click="bulkMoveToCollection(collection.id)"
                      >
                        <span
                          class="w-2 h-2 rounded-full"
                          :style="{ backgroundColor: collection.color || '#94a3b8' }"
                        ></span>
                        {{ collection.name }}
                      </button>
                    </div>
                  </Transition>
                </div>

                <!-- Remove button -->
                <button
                  type="button"
                  class="px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                  :disabled="selectedCount === 0"
                  :class="{ 'opacity-50 cursor-not-allowed': selectedCount === 0 }"
                  @click="openBulkRemoveModal"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Remove
                </button>

                <!-- Cancel button -->
                <button
                  type="button"
                  class="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  @click="cancelSelectMode"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            </template>
          </div>

          <!-- Results counter -->
          <p class="text-xs text-slate-400 mb-2">
            <template v-if="searchQuery">
              Showing {{ filteredCount }} of {{ totalCount }}
            </template>
            <template v-else>
              {{ totalCount }} {{ totalCount === 1 ? 'bookmark' : 'bookmarks' }}
            </template>
          </p>

          <!-- Results Area -->
          <div>
            <!-- Loading State -->
            <div
              v-if="bookmarkStore.loading"
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"
            >
              <p class="text-sm text-slate-500">Loading bookmarks...</p>
            </div>

            <!-- Error State -->
            <div
              v-else-if="bookmarkStore.error"
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"
            >
              <p class="text-sm text-red-600">{{ bookmarkStore.error }}</p>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="searchFiltered.length === 0"
              class="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center"
            >
              <p class="text-sm text-slate-600 mb-1">
                {{ searchQuery ? 'No bookmarks match your search' : 'No bookmarks yet' }}
              </p>
              <p v-if="!searchQuery" class="text-xs text-slate-500">
                Save posts from your feed to build your collection
              </p>
            </div>

            <!-- Bookmarks List -->
            <div v-else class="space-y-1.5">
              <BookmarkListItem
                v-for="(bookmark, index) in searchFiltered"
                :key="bookmark.id"
                :bookmark="bookmark"
                :selectable="selectMode"
                :selected="isSelected(bookmark.post.id)"
                @remove="handleRemoveBookmark"
                @select="(e: MouseEvent) => handleSelect(bookmark.post.id, index, e)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- CreateCollectionModal (Placeholder) -->
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
          <BaseButton @click="showCreateModal = false" variant="outline" class="w-full">
            Close
          </BaseButton>
        </div>
      </div>

      <!-- Bulk Remove Confirmation Modal -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showBulkRemoveModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            @click.self="showBulkRemoveModal = false"
          >
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="showBulkRemoveModal"
                class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              >
                <div class="flex items-start gap-4 mb-4">
                  <div class="p-3 bg-red-100 rounded-full flex-shrink-0">
                    <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-slate-900 mb-2">
                      Remove {{ selectedCount }} bookmark{{ selectedCount === 1 ? '' : 's' }}?
                    </h3>
                    <p class="text-sm text-slate-600">
                      These posts will be removed from your saved collection. Any personal notes will be lost. This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div class="flex gap-3 justify-end">
                  <button
                    @click="showBulkRemoveModal = false"
                    class="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    :disabled="bulkActionLoading"
                  >
                    Cancel
                  </button>
                  <button
                    @click="confirmBulkRemove"
                    class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                    :disabled="bulkActionLoading"
                  >
                    <svg v-if="bulkActionLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ bulkActionLoading ? 'Removing...' : 'Remove bookmarks' }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
/**
 * Bookmarks container - compact layout
 */
.content-glass-container {
  background: transparent;
  border-radius: 16px;
}

/* Ambient mode: premium glass panel */
.content-glass-container.ambient-mode {
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(10px) saturate(120%);
  -webkit-backdrop-filter: blur(10px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.02);
  padding: 16px;
}

/* Fallback for browsers without backdrop-filter support */
@supports not (backdrop-filter: blur(10px)) {
  .content-glass-container.ambient-mode {
    background: rgba(255, 255, 255, 0.85);
  }
}
</style>
