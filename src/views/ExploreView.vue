<!-- Explore page for discovering posts and users -->
<script setup lang="ts">
defineOptions({ name: 'ExploreView' })

import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postsApi } from '@/services/api/posts'
import { usersApi, followApi } from '@/services/api/users'
import { bookmarksApi } from '@/services/api/bookmarks'
import type { User } from '@/services/api/types'
import type { PostCardData } from '@/utils/postMapper'
import { mapApiPostToCard } from '@/utils/postMapper'
import { useToastStore } from '@/stores/toastStore'
import { logger } from '@/services/logger'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore } from '@/stores/uiStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useDebounce } from '@/composables/useDebounce'
import { getErrorMessage } from '@/services/api/client'
import { PAGE_CONFIG, UI_CONFIG } from '@/data/constants'
import PostCard from '@/components/organisms/PostCard.vue'
import UserCard from '@/components/molecules/UserCard.vue'
import TagFilterDropdown from '@/components/molecules/TagFilterDropdown.vue'
import PageHeader from '@/components/atoms/PageHeader.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const toastStore = useToastStore()
const userStore = useUserStore()
const appearanceStore = useAppearanceStore()

// Ambient mode detection
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// Search state
const searchInput = ref('')
const searchQuery = useDebounce(searchInput, UI_CONFIG.DEBOUNCE_MS)

// Tab state: posts or users
const searchMode = ref<'posts' | 'users'>('posts')

// Subject filter
const selectedSubject = ref('')

// Dynamic tags from API
const availableTags = ref<string[]>([])
const tagsLoading = ref(false)

// Posts state
const posts = ref<PostCardData[]>([])
const postsPage = ref(0)
const postsTotalPages = ref(1)
const postsLoading = ref(false)
const postsLoadingMore = ref(false)

// Users state
const users = ref<User[]>([])
const usersPage = ref(0)
const usersTotalPages = ref(1)
const usersLoading = ref(false)
const usersLoadingMore = ref(false)
const followingStatus = ref<Record<string, boolean>>({})

const error = ref<string | null>(null)

// Load posts
async function loadPosts(reset = false) {
  if (reset) {
    postsPage.value = 0
    posts.value = []
  }

  const isFirstPage = postsPage.value === 0 && posts.value.length === 0
  if (isFirstPage) {
    postsLoading.value = true
  } else {
    postsLoadingMore.value = true
  }
  error.value = null

  try {
    const result = await postsApi.getAllPosts(
      searchQuery.value || undefined,
      postsPage.value,
      PAGE_CONFIG.DEFAULT_SIZE,
      'all',
      selectedSubject.value || undefined
    )
    const mapped = result.content.map((post) => mapApiPostToCard(post))
    posts.value = reset ? mapped : [...posts.value, ...mapped]
    postsTotalPages.value = result.totalPages
  } catch (err) {
    error.value = getErrorMessage(err)
    toastStore.showError(error.value, 'Explore')
  } finally {
    postsLoading.value = false
    postsLoadingMore.value = false
  }
}

// Load more posts
function loadMorePosts() {
  if (postsPage.value + 1 >= postsTotalPages.value) return
  postsPage.value += 1
  loadPosts()
}

// Load users
async function loadUsers(reset = false) {
  if (reset) {
    usersPage.value = 0
    users.value = []
  }

  if (!searchQuery.value) {
    users.value = []
    return
  }

  const isFirstPage = usersPage.value === 0 && users.value.length === 0
  if (isFirstPage) {
    usersLoading.value = true
  } else {
    usersLoadingMore.value = true
  }
  error.value = null

  try {
    const result = await usersApi.searchUsers(searchQuery.value, usersPage.value, PAGE_CONFIG.DEFAULT_SIZE)
    users.value = reset ? result.content : [...users.value, ...result.content]
    usersTotalPages.value = result.totalPages
  } catch (err) {
    error.value = getErrorMessage(err)
    toastStore.showError(error.value, 'Search Users')
  } finally {
    usersLoading.value = false
    usersLoadingMore.value = false
  }
}

// Load more users
function loadMoreUsers() {
  if (usersPage.value + 1 >= usersTotalPages.value) return
  usersPage.value += 1
  loadUsers()
}

// React to debounced search query changes
watch(searchQuery, () => {
  if (searchMode.value === 'posts') {
    loadPosts(true)
  } else {
    loadUsers(true)
  }
})

// Watch subject filter
watch(selectedSubject, () => {
  loadPosts(true)
})

// Watch search mode
watch(searchMode, () => {
  if (searchMode.value === 'posts') {
    loadPosts(true)
  } else if (searchQuery.value) {
    loadUsers(true)
  }
})

// Load available tags
async function loadTags() {
  tagsLoading.value = true
  try {
    availableTags.value = await postsApi.getSubjects()
  } catch (err) {
    logger.error('Failed to load tags:', err)
  } finally {
    tagsLoading.value = false
  }
}

// Initial load
onMounted(() => {
  loadPosts(true)
  loadTags()
})

// Post interactions
async function toggleLike(postId: PostCardData['id']) {
  const idx = posts.value.findIndex((p) => p.id === postId)
  const original = posts.value[idx]
  if (idx === -1 || !original) return

  const optimisticLiked = !original.liked
  const optimisticLikes = original.likes + (optimisticLiked ? 1 : -1)
  posts.value[idx] = { ...original, liked: optimisticLiked, likes: Math.max(0, optimisticLikes) }

  try {
    if (optimisticLiked) {
      await postsApi.likePost(String(postId))
    } else {
      await postsApi.unlikePost(String(postId))
    }
  } catch (err) {
    posts.value[idx] = original
    toastStore.showError(getErrorMessage(err), 'Like')
  }
}

async function toggleBookmark(postId: PostCardData['id']) {
  const idx = posts.value.findIndex((p) => p.id === postId)
  const original = posts.value[idx]
  if (idx === -1 || !original) return

  const optimisticBookmarked = !original.bookmarked
  const optimisticBookmarkCount = original.bookmarkCount + (optimisticBookmarked ? 1 : -1)
  posts.value[idx] = {
    ...original,
    bookmarked: optimisticBookmarked,
    bookmarkCount: Math.max(0, optimisticBookmarkCount),
  }

  try {
    if (optimisticBookmarked) {
      await bookmarksApi.createBookmark(String(postId))
    } else {
      await bookmarksApi.deleteBookmark(String(postId))
    }
  } catch (err) {
    posts.value[idx] = original
    toastStore.showError(getErrorMessage(err), 'Bookmark')
  }
}

// User interactions
async function handleFollow(userId: string) {
  try {
    await followApi.follow(userId)
    followingStatus.value[userId] = true
    toastStore.showSuccess('User followed')
  } catch (err) {
    toastStore.showError(getErrorMessage(err), 'Follow')
  }
}

async function handleUnfollow(userId: string) {
  try {
    await followApi.unfollow(userId)
    followingStatus.value[userId] = false
    toastStore.showSuccess('User unfollowed')
  } catch (err) {
    toastStore.showError(getErrorMessage(err), 'Unfollow')
  }
}

function goToUserProfile(user: User) {
  router.push({ name: 'user-profile', params: { id: user.id } })
}

function clearSearch() {
  searchInput.value = ''
  searchQuery.value = ''
  searchMode.value = 'posts'
  loadPosts(true)
}
</script>

<template>
  <main class="min-h-screen flex items-start justify-center px-8">
    <div
      class="w-full max-w-3xl py-8 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Page Header -->
      <PageHeader title="Explore" subtitle="Discover posts and people" />

      <!-- Search Input -->
      <div class="relative mb-4">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
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
          placeholder="Search posts or users..."
          class="w-full pl-11 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        />
        <button
          v-if="searchInput"
          type="button"
          aria-label="Clear search"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          @click="clearSearch"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Posts/Users Tabs (show when searching) -->
      <div v-if="searchQuery" class="flex gap-1 mb-4 border-b border-slate-200">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="searchMode === 'posts'
            ? 'text-blue-600 border-b-2 border-blue-500'
            : 'text-slate-500 hover:text-slate-700'"
          @click="searchMode = 'posts'"
        >
          Posts
        </button>
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="searchMode === 'users'
            ? 'text-blue-600 border-b-2 border-blue-500'
            : 'text-slate-500 hover:text-slate-700'"
          @click="searchMode = 'users'"
        >
          Users
        </button>
      </div>

      <!-- Tag Filter (show when viewing posts) -->
      <div v-if="searchMode === 'posts'" class="mb-4">
        <TagFilterDropdown
          v-model="selectedSubject"
          :tags="availableTags"
          :loading="tagsLoading"
        />
      </div>

      <!-- Posts Results -->
      <div v-if="searchMode === 'posts'">
        <!-- Loading -->
        <div v-if="postsLoading" class="space-y-6">
          <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-lg p-6 animate-pulse">
            <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-300 rounded w-full mb-1"></div>
            <div class="h-3 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-600 text-sm">{{ error }}</p>
          <BaseButton class="mt-3" variant="outline" size="sm" @click="loadPosts(true)">Retry</BaseButton>
        </div>

        <!-- Empty -->
        <div v-else-if="posts.length === 0" class="text-center py-12">
          <p class="text-slate-600 text-sm">
            {{ searchQuery ? 'No posts match your search' : 'No posts found' }}
          </p>
          <p v-if="selectedSubject" class="text-slate-500 text-xs mt-2">
            Try selecting a different subject or clear the filter
          </p>
        </div>

        <!-- Posts List -->
        <div v-else class="space-y-6">
          <PostCard
            v-for="p in posts"
            :key="p.id"
            :post="p"
            :current-user-id="userStore.user?.id"
            @like="toggleLike"
            @save="toggleBookmark"
          />

          <!-- Load more -->
          <div v-if="postsPage + 1 < postsTotalPages" class="flex justify-center pt-2">
            <BaseButton :disabled="postsLoadingMore" variant="outline" @click="loadMorePosts">
              {{ postsLoadingMore ? 'Loading...' : 'Load more' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Users Results -->
      <div v-else>
        <!-- No search query -->
        <div v-if="!searchQuery" class="text-center py-12">
          <p class="text-slate-600 text-sm">Enter a search term to find users</p>
        </div>

        <!-- Loading -->
        <div v-else-if="usersLoading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div class="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-600 text-sm">{{ error }}</p>
          <BaseButton class="mt-3" variant="outline" size="sm" @click="loadUsers(true)">Retry</BaseButton>
        </div>

        <!-- Empty -->
        <div v-else-if="users.length === 0" class="text-center py-12">
          <p class="text-slate-600 text-sm">No users found for "{{ searchQuery }}"</p>
        </div>

        <!-- Users List -->
        <div v-else class="space-y-3">
          <UserCard
            v-for="user in users"
            :key="user.id"
            :user="user"
            :avatar-src="user.profileImageUrl ?? undefined"
            :is-following="followingStatus[user.id] ?? false"
            @click="goToUserProfile"
            @follow="handleFollow"
            @unfollow="handleUnfollow"
          />

          <!-- Load more -->
          <div v-if="usersPage + 1 < usersTotalPages" class="flex justify-center pt-2">
            <BaseButton :disabled="usersLoadingMore" variant="outline" @click="loadMoreUsers">
              {{ usersLoadingMore ? 'Loading...' : 'Load more' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/**
 * Explore container
 * Clean mode: minimal styling
 * Ambient mode: premium glass panel
 */
.content-glass-container {
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
