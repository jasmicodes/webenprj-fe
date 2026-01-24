<!-- FollowerListModal - Tabbed modal for followers/following -->
<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import { getErrorMessage } from '@/services/api/client'
import { followApi, usersApi } from '@/services/api/users'
import type { User } from '@/services/api/types'

import BaseModal from '@/components/atoms/BaseModal.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
import FollowButton from '@/components/molecules/FollowButton.vue'
import { PAGE_CONFIG, UI_CONFIG } from '@/data/constants'

defineOptions({ name: 'FollowerListModal' })

const PAGE_SIZE = PAGE_CONFIG.FOLLOWERS_SIZE

const props = withDefaults(
  defineProps<{
    userId: string
    initialTab?: 'followers' | 'following'
    followersCount?: number
    followingCount?: number
  }>(),
  {
    initialTab: 'followers',
    followersCount: 0,
    followingCount: 0,
  },
)

const open = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  followStatusChanged: [userId: string, isFollowing: boolean]
}>()

const router = useRouter()
const userStore = useUserStore()
const toastStore = useToastStore()

// State
const activeTab = ref<'followers' | 'following'>(props.initialTab)
const users = ref<User[]>([])
const followingStatus = ref<Record<string, boolean>>({})
const loadingUsers = ref<Record<string, boolean>>({})
const loading = ref(false)
const page = ref(0)
const totalPages = ref(1)
const hasMore = computed(() => page.value + 1 < totalPages.value)

// Search state
const searchQuery = ref('')
const isSearching = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null
// Track request ID to prevent stale results from overwriting newer ones
let searchRequestId = 0

// Infinite scroll state
const scrollSentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Current user ID for hiding follow button on own profile
const currentUserId = computed(() => userStore.user?.id)

// Tab counts (use props if provided, otherwise show loaded count)
const followersTabCount = computed(() => props.followersCount)
const followingTabCount = computed(() => props.followingCount)

// Format large numbers (e.g., 1200000 -> "1.2M", 45300 -> "45.3K")
function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return String(count)
}

// Setup infinite scroll observer
function setupInfiniteScroll() {
  cleanupObserver()
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting && hasMore.value && !loading.value && !isSearching.value) {
        loadMore()
      }
    },
    { threshold: 0.1 },
  )
  if (scrollSentinel.value) {
    observer.observe(scrollSentinel.value)
  }
}

function cleanupObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

// Cleanup on unmount
onUnmounted(() => {
  cleanupObserver()
  if (searchTimeout) clearTimeout(searchTimeout)
})

// Search handler with debounce
function handleSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(async () => {
    const query = searchQuery.value.trim()
    if (query) {
      // Increment request ID to track this specific request
      const currentRequestId = ++searchRequestId
      isSearching.value = true
      loading.value = true
      try {
        const result = await usersApi.searchUsers(query, 0, PAGE_SIZE)
        // Only update if this is still the latest request (prevents stale results)
        if (currentRequestId !== searchRequestId) return
        users.value = result.content
        totalPages.value = result.totalPages
        page.value = result.number

        // Check following status for search results
        await checkFollowingStatus(users.value)
      } catch (err) {
        // Only show error if this is still the latest request
        if (currentRequestId !== searchRequestId) return
        toastStore.showError(getErrorMessage(err), 'Search')
      } finally {
        // Only update loading state if this is still the latest request
        if (currentRequestId === searchRequestId) {
          loading.value = false
        }
      }
    } else {
      isSearching.value = false
      await resetAndLoad(false)
    }
  }, UI_CONFIG.DEBOUNCE_MS)
}

function clearSearch() {
  searchQuery.value = ''
  isSearching.value = false
  resetAndLoad(false)
}

// Reset and load when modal opens or tab changes
watch(open, async (isOpen) => {
  if (isOpen) {
    activeTab.value = props.initialTab
    searchQuery.value = ''
    isSearching.value = false
    await resetAndLoad(true)
    // Setup infinite scroll after DOM updates
    await nextTick()
    setupInfiniteScroll()
  } else {
    // Clear state when closing
    users.value = []
    followingStatus.value = {}
    page.value = 0
    searchQuery.value = ''
    isSearching.value = false
    cleanupObserver()
  }
})

watch(activeTab, async () => {
  searchQuery.value = ''
  isSearching.value = false
  await resetAndLoad(false)
  await nextTick()
  setupInfiniteScroll()
})

async function resetAndLoad(clearStatus = false) {
  page.value = 0
  users.value = []
  // Only clear followingStatus when modal opens, not when switching tabs
  // This preserves follow state for users who appear in both tabs
  if (clearStatus) {
    followingStatus.value = {}
  }
  await loadUsers(true)
}

// Helper to check following status for a list of users
async function checkFollowingStatus(userList: User[]) {
  // Optimization: If viewing own profile's "following" tab, we're already following everyone
  const isOwnFollowingTab = props.userId === currentUserId.value && activeTab.value === 'following'

  if (isOwnFollowingTab) {
    userList.forEach((u) => {
      if (u.id !== currentUserId.value) {
        followingStatus.value[u.id] = true
      }
    })
  } else {
    // Need to check each user's follow status via API
    const statusChecks = userList
      .filter((u) => u.id !== currentUserId.value && !(u.id in followingStatus.value))
      .map(async (user) => {
        try {
          const isFollowing = await usersApi.isFollowing(user.id)
          return { userId: user.id, isFollowing }
        } catch {
          return { userId: user.id, isFollowing: false }
        }
      })
    const results = await Promise.all(statusChecks)
    results.forEach((r) => {
      followingStatus.value[r.userId] = r.isFollowing
    })
  }
}

async function loadUsers(reset = false) {
  if (loading.value) return
  loading.value = true

  try {
    const pageResult =
      activeTab.value === 'followers'
        ? await followApi.getFollowers(props.userId, reset ? 0 : page.value, PAGE_SIZE)
        : await followApi.getFollowing(props.userId, reset ? 0 : page.value, PAGE_SIZE)

    const newUsers = pageResult.content
    users.value = reset ? newUsers : [...users.value, ...newUsers]
    totalPages.value = pageResult.totalPages
    page.value = pageResult.number

    await checkFollowingStatus(newUsers)
  } catch (err) {
    toastStore.showError(getErrorMessage(err), activeTab.value === 'followers' ? 'Followers' : 'Following')
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || loading.value) return
  page.value += 1
  await loadUsers()
}

async function handleFollowToggle(user: User) {
  const userId = user.id
  if (loadingUsers.value[userId]) return

  loadingUsers.value[userId] = true
  const wasFollowing = followingStatus.value[userId] ?? false

  try {
    if (wasFollowing) {
      await followApi.unfollow(userId)
      followingStatus.value[userId] = false
      toastStore.showSuccess('Unfollowed')
    } else {
      await followApi.follow(userId)
      followingStatus.value[userId] = true
      toastStore.showSuccess('Following')
    }
    emit('followStatusChanged', userId, !wasFollowing)
  } catch (err) {
    toastStore.showError(getErrorMessage(err), wasFollowing ? 'Unfollow' : 'Follow')
  } finally {
    delete loadingUsers.value[userId]
  }
}

function navigateToUser(user: User) {
  open.value = false
  if (user.id === currentUserId.value) {
    router.push({ name: 'profile' })
  } else {
    router.push({ name: 'user-profile', params: { id: user.id } })
  }
}

function closeModal() {
  open.value = false
}
</script>

<template>
  <BaseModal v-model="open">
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden flex flex-col"
      style="height: min(560px, 85vh)"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 class="text-base font-semibold text-slate-900">
          {{ activeTab === 'followers' ? 'Followers' : 'Following' }}
        </h2>
        <button
          type="button"
          class="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
          @click="closeModal"
        >
          <BaseIcon name="XMarkIcon" size="w-5 h-5" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-100">
        <button
          type="button"
          class="flex-1 py-2.5 text-sm font-medium transition-colors relative"
          :class="
            activeTab === 'followers' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          "
          @click="activeTab = 'followers'"
        >
          <span>Followers</span>
          <span
            v-if="followersTabCount > 0"
            class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
            :class="
              activeTab === 'followers'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500'
            "
          >
            {{ formatCount(followersTabCount) }}
          </span>
          <!-- Active indicator -->
          <div
            v-if="activeTab === 'followers'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
          ></div>
        </button>

        <button
          type="button"
          class="flex-1 py-2.5 text-sm font-medium transition-colors relative"
          :class="
            activeTab === 'following' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
          "
          @click="activeTab = 'following'"
        >
          <span>Following</span>
          <span
            v-if="followingTabCount > 0"
            class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
            :class="
              activeTab === 'following'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500'
            "
          >
            {{ formatCount(followingTabCount) }}
          </span>
          <!-- Active indicator -->
          <div
            v-if="activeTab === 'following'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
          ></div>
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative border-b border-slate-100">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="w-full px-4 py-2.5 text-sm bg-transparent focus:outline-none placeholder-slate-400"
          @input="handleSearchInput"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          @click="clearSearch"
        >
          <BaseIcon name="XMarkIcon" size="w-4 h-4" />
        </button>
      </div>

      <!-- User List -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <!-- Skeleton loading state (initial load) -->
        <div v-if="loading && users.length === 0" class="divide-y divide-slate-100">
          <div
            v-for="i in 5"
            :key="i"
            class="flex items-center gap-3 px-4 py-3 animate-pulse"
          >
            <div class="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-200 rounded w-24" />
              <div class="h-3 bg-slate-200 rounded w-16" />
            </div>
            <div class="w-16 h-8 bg-slate-200 rounded-full" />
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!loading && users.length === 0" class="py-12 text-center">
          <div
            class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3"
          >
            <BaseIcon name="UsersOutlineIcon" class="w-6 h-6 text-slate-400" />
          </div>
          <p class="text-sm text-slate-600">
            <template v-if="isSearching">No users found</template>
            <template v-else>
              {{ activeTab === 'followers' ? 'No followers yet' : 'Not following anyone' }}
            </template>
          </p>
        </div>

        <!-- User cards -->
        <template v-else>
          <div class="divide-y divide-slate-100">
            <div
              v-for="user in users"
              :key="user.id"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
              @click="navigateToUser(user)"
            >
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <BaseAvatar
                  :src="user.profileImageUrl || undefined"
                  :alt="`${user.username}'s avatar`"
                  class="w-10 h-10"
                />
              </div>

              <!-- User info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 truncate">
                  {{ user.username }}
                </p>
                <p v-if="user.salutation" class="text-xs text-slate-500 truncate">
                  {{ user.salutation }}
                </p>
              </div>

              <!-- Follow button (not shown for own profile) - stop propagation to prevent row click -->
              <FollowButton
                v-if="user.id !== currentUserId"
                :is-following="followingStatus[user.id] ?? false"
                :loading="loadingUsers[user.id] ?? false"
                size="sm"
                @click.stop
                @toggle="handleFollowToggle(user)"
              />

              <!-- "You" badge for own profile -->
              <span
                v-else
                class="text-xs font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100"
              >
                You
              </span>
            </div>
          </div>

          <!-- Infinite scroll sentinel -->
          <div ref="scrollSentinel" class="h-1" />

          <!-- Loading more indicator -->
          <div v-if="loading && users.length > 0" class="py-3 text-center">
            <div class="inline-flex items-center gap-2 text-sm text-slate-500">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Loading more...</span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </BaseModal>
</template>
