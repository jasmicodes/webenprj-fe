<!-- Public user profile view -->
<script setup lang="ts">
defineOptions({ name: 'UserProfileView' })

import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore } from '@/stores/uiStore'
import { useToastStore } from '@/stores/toastStore'
import { getErrorMessage } from '@/services/api/client'
import { usersApi, followApi } from '@/services/api/users'
import { postsApi } from '@/services/api/posts'
import { bookmarksApi } from '@/services/api/bookmarks'
import { COUNTRIES_DACH_FIRST } from '@/data/countries'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { mapApiPostToCard } from '@/utils/postMapper'
import type { User } from '@/services/api/types'
import type { PostCardData } from '@/utils/postMapper'

import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import BaseAvatar from '@/components/atoms/BaseAvatar.vue'
import PostCard from '@/components/organisms/PostCard.vue'
import PageHeader from '@/components/atoms/PageHeader.vue'
import FollowButton from '@/components/molecules/FollowButton.vue'
import ClickableFollowStats from '@/components/molecules/ClickableFollowStats.vue'
import FollowerListModal from '@/components/organisms/FollowerListModal.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appearanceStore = useAppearanceStore()
const toastStore = useToastStore()

// Route prop
const userId = computed(() => route.params.id as string)

// Loading states
const loading = ref(true)
const error = ref<string | null>(null)

// User data
const user = ref<User | null>(null)
const followers = ref<number>(0)
const following = ref<number>(0)
const isFollowing = ref(false)
const followLoading = ref(false)

// Follower modal state
const showFollowerModal = ref(false)
const followerModalTab = ref<'followers' | 'following'>('followers')

// Posts
const posts = ref<PostCardData[]>([])
const postsPage = ref(0)
const postsTotalPages = ref(1)
const postsLoading = ref(false)

// Computed
const isOwnProfile = computed(() => userStore.user?.id === userId.value)
const countryName = computed(() => {
  if (!user.value?.countryCode) return 'Unknown'
  const c = COUNTRIES_DACH_FIRST.find((x) => x.code === user.value!.countryCode)
  return c?.label ?? user.value!.countryCode
})

// Ambient mode detection
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// Load user profile
async function loadProfile() {
  loading.value = true
  error.value = null

  try {
    // Load user data
    user.value = await usersApi.getUserById(userId.value)

    // Load follow data in parallel
    const [followersPage, followingPage] = await Promise.all([
      followApi.getFollowers(userId.value, 0, 1),
      followApi.getFollowing(userId.value, 0, 1),
    ])
    followers.value = followersPage.totalElements
    following.value = followingPage.totalElements

    // Check if current user follows this user
    if (!isOwnProfile.value) {
      isFollowing.value = await usersApi.isFollowing(userId.value)
    }

    // Load posts
    await loadPosts(true)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

// Load user's posts
async function loadPosts(reset = false) {
  if (reset) {
    postsPage.value = 0
    posts.value = []
  }

  postsLoading.value = true

  try {
    const result = await postsApi.getPostsByAuthor(userId.value, postsPage.value, 10)
    const mapped = result.content.map((post) => mapApiPostToCard(post))
    posts.value = reset ? mapped : [...posts.value, ...mapped]
    postsTotalPages.value = result.totalPages
  } catch (err) {
    toastStore.showError(getErrorMessage(err), 'Posts')
  } finally {
    postsLoading.value = false
  }
}

// Load more posts
function loadMorePosts() {
  if (postsPage.value + 1 >= postsTotalPages.value) return
  postsPage.value += 1
  loadPosts()
}

// Follow/Unfollow
async function handleFollow() {
  if (followLoading.value) return
  followLoading.value = true

  try {
    if (isFollowing.value) {
      await followApi.unfollow(userId.value)
      isFollowing.value = false
      followers.value = Math.max(0, followers.value - 1)
      toastStore.showSuccess('Unfollowed')
    } else {
      await followApi.follow(userId.value)
      isFollowing.value = true
      followers.value += 1
      toastStore.showSuccess('Following')
    }
  } catch (err) {
    toastStore.showError(getErrorMessage(err), isFollowing.value ? 'Unfollow' : 'Follow')
  } finally {
    followLoading.value = false
  }
}

// Follower modal handlers
function openFollowersModal() {
  followerModalTab.value = 'followers'
  showFollowerModal.value = true
}

function openFollowingModal() {
  followerModalTab.value = 'following'
  showFollowerModal.value = true
}

function handleFollowStatusChanged(changedUserId: string, nowFollowing: boolean) {
  // If this is the profile being viewed, update our local state
  if (changedUserId === userId.value) {
    isFollowing.value = nowFollowing
  }
}

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

// Helpers
function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function goToOwnProfile() {
  router.push({ name: 'profile' })
}

// Watch for route changes (when navigating between profiles)
watch(userId, () => {
  if (userId.value) {
    loadProfile()
  }
})

// Initial load
onMounted(() => {
  // If viewing own profile, redirect to the profile page
  if (isOwnProfile.value) {
    goToOwnProfile()
    return
  }
  loadProfile()
})
</script>

<template>
  <div class="min-h-screen flex items-start justify-center px-4 md:px-8">
    <div
      class="w-full max-w-3xl py-6 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Page Header -->
      <PageHeader title="User Profile" :subtitle="user?.username ? `@${user.username}` : ''" />

      <!-- LOADING -->
      <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
        <p class="text-sm text-slate-500">Loading profile...</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="bg-white rounded-2xl border border-red-200 shadow-sm p-5 text-center">
        <p class="text-sm text-red-600 mb-3">{{ error }}</p>
        <BaseButton variant="outline" size="sm" @click="loadProfile">Retry</BaseButton>
      </div>

      <!-- CONTENT -->
      <div v-else-if="user" class="space-y-5">

        <!-- ==================== PROFILE HEADER CARD ==================== -->
        <BaseCard class="!p-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Left: Avatar -->
            <div class="flex-shrink-0 flex justify-center sm:justify-start">
              <BaseAvatar
                v-if="user.profileImageUrl"
                :src="user.profileImageUrl"
                class="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <BaseAvatar v-else class="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-sm" />
            </div>

            <!-- Center: Identity -->
            <div class="flex-1 min-w-0 text-center sm:text-left">
              <!-- Username as primary identity -->
              <h1 class="text-lg font-semibold text-slate-900 truncate">
                {{ user.username }}
              </h1>
              <!-- Salutation below username -->
              <p v-if="user.salutation" class="text-sm text-slate-600 mt-0.5">{{ user.salutation }}</p>

              <!-- Meta row: country -->
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                  {{ countryName }}
                </span>
                <span class="text-xs text-slate-400">
                  Joined {{ formatMemberSince(user.createdAt) }}
                </span>
              </div>

              <!-- Stats row: followers / following (clickable) -->
              <div class="mt-3">
                <ClickableFollowStats
                  :followers="followers"
                  :following="following"
                  @open-followers="openFollowersModal"
                  @open-following="openFollowingModal"
                />
              </div>
            </div>

            <!-- Right: Follow Button -->
            <div class="flex-shrink-0 flex justify-center sm:justify-end">
              <FollowButton
                :is-following="isFollowing"
                :loading="followLoading"
                size="md"
                show-label
                @toggle="handleFollow"
              />
            </div>
          </div>
        </BaseCard>

        <!-- ==================== POSTS SECTION ==================== -->
        <div>
          <h2 class="text-sm font-semibold text-slate-900 mb-3">Posts</h2>

          <!-- Loading -->
          <div v-if="postsLoading && posts.length === 0" class="space-y-4">
            <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-lg p-6 animate-pulse">
              <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-300 rounded w-full mb-1"></div>
              <div class="h-3 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="posts.length === 0" class="text-center py-8">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <BaseIcon name="PencilSquareIcon" class="w-6 h-6 text-slate-400" />
            </div>
            <p class="text-sm text-slate-600">No posts yet</p>
            <p class="text-xs text-slate-400 mt-1">{{ user.username }} hasn't shared anything yet</p>
          </div>

          <!-- Posts List -->
          <div v-else class="space-y-4">
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
              <BaseButton :disabled="postsLoading" variant="outline" @click="loadMorePosts">
                {{ postsLoading ? 'Loading...' : 'Load more' }}
              </BaseButton>
            </div>
          </div>
        </div>

      </div>

      <!-- NO USER -->
      <div v-else class="text-center py-8">
        <p class="text-sm text-slate-500">User not found</p>
      </div>
    </div>

    <!-- Follower/Following Modal -->
    <FollowerListModal
      v-if="user"
      v-model="showFollowerModal"
      :user-id="userId"
      :initial-tab="followerModalTab"
      :followers-count="followers"
      :following-count="following"
      @follow-status-changed="handleFollowStatusChanged"
    />
  </div>
</template>

<style scoped>
/**
 * Profile container
 * Clean mode: minimal styling
 * Ambient mode: premium glass panel
 */
.content-glass-container {
  background: transparent;
  border-radius: 20px;
  padding-left: 20px;
  padding-right: 20px;
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
