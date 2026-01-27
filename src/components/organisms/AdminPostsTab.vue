<!-- src/components/organisms/AdminPostsTab.vue -->
<script setup lang="ts">
defineOptions({ name: 'AdminPostsTab' })

import { ref, computed, onMounted, watch } from 'vue'
import { adminPostsApi } from '@/services/api/posts'
import type { AdminPost, AdminPostStats } from '@/services/api/types'
import { getErrorMessage } from '@/services/api/client'
import { useToastStore } from '@/stores/toastStore'
import { useDebounce } from '@/composables/useDebounce'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmModal from '@/components/molecules/ConfirmModal.vue'
import {
  TrashIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'

const posts = ref<AdminPost[]>([])
const stats = ref<AdminPostStats | null>(null)
const loading = ref(true)
const loadingStats = ref(true)
const error = ref<string | null>(null)
const togglingPostId = ref<string | null>(null)
const deletingPostId = ref<string | null>(null)
const toast = useToastStore()

// Delete modal state
const showDeleteModal = ref(false)
const postToDelete = ref<AdminPost | null>(null)

// Pagination state
const page = ref(0)
const pageSize = 20
const totalPages = ref(1)
const totalElements = ref(0)
const loadingMore = ref(false)

// Search state
const searchInput = ref('')
const searchQuery = useDebounce(searchInput, 300)

// Filter state
type StatusFilter = 'all' | 'active' | 'deleted'
type TypeFilter = 'all' | 'posts' | 'comments'
const statusFilter = ref<StatusFilter>('all')
const typeFilter = ref<TypeFilter>('all')

// Computed filter values for API
const activeFilter = computed<boolean | undefined>(() => {
  if (statusFilter.value === 'active') return true
  if (statusFilter.value === 'deleted') return false
  return undefined
})

const isCommentFilter = computed<boolean | undefined>(() => {
  if (typeFilter.value === 'posts') return false
  if (typeFilter.value === 'comments') return true
  return undefined
})

// Load stats
async function loadStats() {
  loadingStats.value = true
  try {
    stats.value = await adminPostsApi.getStats()
  } catch (err) {
    toast.showError('Failed to load statistics', 'Error')
  } finally {
    loadingStats.value = false
  }
}

// Load posts with pagination and filters
async function loadPosts(reset = false) {
  if (reset) {
    page.value = 0
    posts.value = []
  }

  const isFirstPage = page.value === 0 && posts.value.length === 0
  if (isFirstPage) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  error.value = null

  try {
    const result = await adminPostsApi.getAllPosts(
      searchQuery.value || undefined,
      activeFilter.value,
      isCommentFilter.value,
      page.value,
      pageSize,
    )
    posts.value = reset ? result.content : [...posts.value, ...result.content]
    totalPages.value = result.totalPages
    totalElements.value = result.totalElements
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (page.value + 1 >= totalPages.value) return
  page.value += 1
  loadPosts()
}

// React to filter/search changes
watch([searchQuery, statusFilter, typeFilter], () => {
  loadPosts(true)
})

onMounted(() => {
  loadStats()
  loadPosts(true)
})

async function toggleActive(post: AdminPost) {
  if (togglingPostId.value) return

  togglingPostId.value = post.id
  const newStatus = !post.active

  try {
    const updated = await adminPostsApi.toggleActive(post.id, newStatus)
    post.active = updated.active
    toast.showSuccess(
      `${post.isComment ? 'Comment' : 'Post'} ${newStatus ? 'restored' : 'deleted'} successfully`,
      newStatus ? 'Restored' : 'Deleted',
    )
    // Refresh stats
    loadStats()
  } catch (err) {
    toast.showError(`Failed to update status: ${getErrorMessage(err)}`, 'Error')
  } finally {
    togglingPostId.value = null
  }
}

function openDeleteModal(post: AdminPost) {
  postToDelete.value = post
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  postToDelete.value = null
}

async function confirmHardDelete() {
  const post = postToDelete.value
  if (!post) return

  deletingPostId.value = post.id

  try {
    await adminPostsApi.hardDelete(post.id)
    posts.value = posts.value.filter((p) => p.id !== post.id)
    toast.showSuccess(`${post.isComment ? 'Comment' : 'Post'} permanently deleted`, 'Deleted')
    closeDeleteModal()
    // Refresh stats
    loadStats()
  } catch (err) {
    toast.showError(`Failed to delete: ${getErrorMessage(err)}`, 'Error')
  } finally {
    deletingPostId.value = null
  }
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Truncate content for display
function truncate(text: string, maxLen = 60): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen) + '...'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div v-if="!loadingStats && stats" class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-50 rounded-lg">
            <DocumentTextIcon class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-semibold text-slate-900">{{ stats.totalPosts }}</p>
            <p class="text-xs text-slate-500">Total Posts</p>
          </div>
        </div>
        <div class="mt-2 flex gap-2 text-xs">
          <span class="text-emerald-600">{{ stats.activePosts }} active</span>
          <span class="text-slate-400">|</span>
          <span class="text-red-500">{{ stats.deletedPosts }} deleted</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-purple-50 rounded-lg">
            <ChatBubbleLeftIcon class="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p class="text-2xl font-semibold text-slate-900">{{ stats.totalComments }}</p>
            <p class="text-xs text-slate-500">Total Comments</p>
          </div>
        </div>
        <div class="mt-2 flex gap-2 text-xs">
          <span class="text-emerald-600">{{ stats.activeComments }} active</span>
          <span class="text-slate-400">|</span>
          <span class="text-red-500">{{ stats.deletedComments }} deleted</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-4 col-span-2 md:col-span-1">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-emerald-50 rounded-lg">
            <CheckCircleIcon class="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p class="text-2xl font-semibold text-slate-900">
              {{ stats.activePosts + stats.activeComments }}
            </p>
            <p class="text-xs text-slate-500">Total Active</p>
          </div>
        </div>
        <div class="mt-2 flex gap-2 text-xs">
          <span class="text-red-500"
            >{{ stats.deletedPosts + stats.deletedComments }} total deleted</span
          >
        </div>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search input -->
      <div class="relative flex-1 min-w-[200px] max-w-sm">
        <svg
          class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <label for="admin-post-search" class="sr-only">Search posts</label>
        <input
          id="admin-post-search"
          v-model="searchInput"
          type="text"
          inputmode="search"
          autocomplete="off"
          placeholder="Search posts..."
          class="w-full pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        />
        <button
          v-if="searchInput"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          @click="searchInput = ''"
          aria-label="Clear search"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Status filter -->
      <select
        v-model="statusFilter"
        class="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="deleted">Deleted</option>
      </select>

      <!-- Type filter -->
      <select
        v-model="typeFilter"
        class="text-sm px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      >
        <option value="all">All Types</option>
        <option value="posts">Posts Only</option>
        <option value="comments">Comments Only</option>
      </select>

      <!-- Count badge -->
      <div
        v-if="!loading && !error"
        class="text-xs font-medium px-2.5 py-1 rounded-md flex-shrink-0 text-slate-500 bg-slate-50/80 border border-slate-100"
      >
        {{ posts.length }} of {{ totalElements }}
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-slate-200 rounded w-1/4"></div>
          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="flex gap-4">
              <div class="h-3 bg-slate-100 rounded w-1/6"></div>
              <div class="h-3 bg-slate-100 rounded w-1/5"></div>
              <div class="h-3 bg-slate-100 rounded w-1/3"></div>
              <div class="h-3 bg-slate-100 rounded w-1/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p class="text-sm text-red-600">{{ error }}</p>
      <BaseButton class="mt-4" variant="outline" @click="loadPosts(true)"> Retry </BaseButton>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="posts.length === 0"
      class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center"
    >
      <p class="text-sm text-slate-600 mb-1">
        {{ searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? 'No posts match your filters' : 'No posts found' }}
      </p>
      <p class="text-xs text-slate-500">
        {{ searchQuery ? 'Try a different search term or adjust filters' : 'Posts will appear here once users create them' }}
      </p>
    </div>

    <!-- Posts Table -->
    <BaseCard v-else class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-100">
              <th
                class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Subject
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Content
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Author
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-28"
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr v-for="post in posts" :key="post.id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  :class="
                    post.isComment
                      ? 'bg-purple-50 text-purple-700 border border-purple-100'
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  "
                >
                  <component
                    :is="post.isComment ? ChatBubbleLeftIcon : DocumentTextIcon"
                    class="w-3 h-3"
                  />
                  {{ post.isComment ? 'Comment' : 'Post' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="font-medium text-slate-700">{{ post.subject }}</span>
              </td>
              <td class="px-4 py-3 text-slate-600 max-w-xs">
                <span :title="post.content">{{ truncate(post.content) }}</span>
              </td>
              <td class="px-4 py-3">
                <div>
                  <p class="font-medium text-slate-900">{{ post.username }}</p>
                  <p class="text-xs text-slate-500">{{ post.userEmail }}</p>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="
                    post.active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-red-50 text-red-600 border border-red-100'
                  "
                >
                  {{ post.active ? 'Active' : 'Deleted' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-600">
                {{ formatDate(post.createdAt) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  <!-- Toggle Active Button -->
                  <button
                    class="p-2 rounded-md transition-colors"
                    :class="
                      post.active
                        ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    "
                    :disabled="togglingPostId === post.id"
                    :aria-label="post.active ? 'Soft delete' : 'Restore'"
                    :title="post.active ? 'Soft delete' : 'Restore'"
                    @click="toggleActive(post)"
                  >
                    <component
                      :is="post.active ? NoSymbolIcon : CheckCircleIcon"
                      class="w-5 h-5"
                      :class="{ 'animate-pulse': togglingPostId === post.id }"
                    />
                  </button>

                  <!-- Hard Delete Button -->
                  <button
                    class="p-2 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    :disabled="deletingPostId === post.id"
                    aria-label="Permanently delete"
                    title="Permanently delete"
                    @click="openDeleteModal(post)"
                  >
                    <TrashIcon
                      class="w-5 h-5"
                      :class="{ 'animate-pulse': deletingPostId === post.id }"
                    />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <!-- Load more button -->
    <div
      v-if="!loading && !error && posts.length > 0 && page + 1 < totalPages"
      class="flex justify-center"
    >
      <BaseButton :disabled="loadingMore" variant="outline" @click="loadMore">
        <span v-if="loadingMore">Loading...</span>
        <span v-else>Load more</span>
      </BaseButton>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :show="showDeleteModal"
      :title="`Permanently delete ${postToDelete?.isComment ? 'comment' : 'post'}?`"
      :message="`This will permanently remove this ${postToDelete?.isComment ? 'comment' : 'post'}. This action cannot be undone.`"
      confirm-text="Delete permanently"
      variant="danger"
      :is-loading="deletingPostId !== null"
      @close="closeDeleteModal"
      @confirm="confirmHardDelete"
    />
  </div>
</template>
