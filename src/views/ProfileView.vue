<!-- src/views/ProfileView.vue -->
<script setup lang="ts">
defineOptions({ name: 'ProfileView' })

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { useToastStore } from '@/stores/toastStore'
import { getErrorMessage } from '@/services/api/client'
import { followApi, postsApi, bookmarksApi } from '@/services/api'
import { usersApi } from '@/services/api/users'
import { COUNTRIES_DACH_FIRST } from '@/utils/countries'
import { useMediaQuery } from '@/composables/useMediaQuery'
import type { User, Post } from '@/services/api/types'

import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import UserAvatar from '@/components/molecules/UserAvatar.vue'
import EditProfileModal from '@/components/molecules/EditProfileModal.vue'

// -------------------- STORES & STATES --------------------
const userStore = useUserStore()
const appearanceStore = useAppearanceStore()
const toastStore = useToastStore()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)

// Profile data
const followers = ref<number>(0)
const following = ref<number>(0)
const postsCount = ref<number>(0)
const bookmarksCount = ref<number>(0)
const recentPosts = ref<Post[]>([])
const profileImageSrc = ref<string | null>(null)

// Computed
const user = computed(() => userStore.user)
const isAdmin = computed(() => user.value?.role === 'ADMIN')
const countryName = computed(() => {
  if (!user.value?.countryCode) return 'Unknown'
  const c = COUNTRIES_DACH_FIRST.find((x) => x.code === user.value!.countryCode)
  return c?.label ?? user.value!.countryCode
})

// Ambient mode detection
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// -------------------- EDIT MODAL --------------------
const showEditModal = ref(false)

function openEditModal() {
  showEditModal.value = true
}

async function onProfileSaved(updatedUser: User) {
  userStore.user = updatedUser
  if (updatedUser.profileImageUrl) {
    profileImageSrc.value = await userStore.downloadProfileImage()
  } else {
    profileImageSrc.value = null
  }
}

// -------------------- LIFECYCLE --------------------
onMounted(async () => {
  try {
    if (!userStore.user) await userStore.fetchCurrentUser()
    if (userStore.user) {
      // Load all data in parallel
      await Promise.all([
        loadFollowData(),
        loadPostsData(),
        loadBookmarksData(),
        loadProfileImage(),
      ])
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
})

// -------------------- DATA LOADING --------------------
async function loadFollowData() {
  if (!userStore.user) return
  try {
    const [followersPage, followingPage] = await Promise.all([
      followApi.getFollowers(userStore.user.id, 0, 1),
      followApi.getFollowing(userStore.user.id, 0, 1),
    ])
    followers.value = followersPage.totalElements
    following.value = followingPage.totalElements
  } catch {
    toastStore.showError('Failed to load follow data')
  }
}

async function loadPostsData() {
  if (!userStore.user) return
  try {
    // Get user's posts and comments via dedicated endpoint
    const activityPage = await usersApi.getMyPosts(0, 10)
    // Count only top-level posts (not comments)
    postsCount.value = activityPage.content.filter(p => !p.parentId).length
    // Show all activity (posts + comments) in recent activity
    recentPosts.value = activityPage.content.slice(0, 5)
  } catch {
    toastStore.showError('Failed to load posts')
  }
}

async function loadBookmarksData() {
  try {
    const bookmarksPage = await bookmarksApi.getUserBookmarks(0, 1)
    bookmarksCount.value = bookmarksPage.totalElements
  } catch {
    toastStore.showError('Failed to load bookmarks')
  }
}

async function loadProfileImage() {
  if (userStore.user?.profileImageUrl) {
    profileImageSrc.value = await userStore.downloadProfileImage()
  }
}

// -------------------- HELPERS --------------------
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function goToHome() {
  router.push({ name: 'home' })
}

function goToPost(post: Post) {
  // For comments, navigate to the parent post; for top-level posts, navigate directly
  const targetId = post.parentId ?? post.id
  router.push({ name: 'post', params: { id: targetId } })
}
</script>

<template>
  <div class="min-h-screen flex items-start justify-center px-4 md:px-8">
    <div
      class="w-full max-w-3xl py-6 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- LOADING -->
      <div v-if="loading" class="flex justify-center items-center min-h-[300px]">
        <p class="text-sm text-slate-500">Loading profile...</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="error" class="bg-white rounded-2xl border border-red-200 shadow-sm p-5 text-center">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- CONTENT -->
      <div v-else-if="user" class="space-y-5">

        <!-- ==================== PROFILE HEADER CARD ==================== -->
        <BaseCard class="!p-4">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Left: Avatar -->
            <div class="flex-shrink-0 flex justify-center sm:justify-start">
              <UserAvatar
                v-if="profileImageSrc"
                :src="profileImageSrc"
                class="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <UserAvatar v-else class="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-sm" />
            </div>

            <!-- Center: Identity -->
            <div class="flex-1 min-w-0 text-center sm:text-left">
              <!-- Username as primary identity -->
              <h1 class="text-lg font-semibold text-slate-900 truncate">
                {{ user.username }}
              </h1>
              <!-- Salutation below username (replaces redundant @handle) -->
              <p v-if="user.salutation" class="text-sm text-slate-600 mt-0.5">{{ user.salutation }}</p>

              <!-- Meta row: country + demoted admin badge -->
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                  {{ countryName }}
                </span>
                <span
                  v-if="isAdmin"
                  class="inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-500 text-[10px] font-medium border border-slate-200"
                >
                  Admin
                </span>
              </div>

              <!-- Stats row: followers / following (always show, mute zeros) -->
              <div class="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm">
                <div class="flex items-baseline gap-1">
                  <span :class="followers === 0 ? 'font-medium text-slate-400' : 'font-semibold text-slate-900'">{{ followers }}</span>
                  <span class="text-slate-400">Followers</span>
                </div>
                <div class="w-px h-3.5 bg-slate-200"></div>
                <div class="flex items-baseline gap-1">
                  <span :class="following === 0 ? 'font-medium text-slate-400' : 'font-semibold text-slate-900'">{{ following }}</span>
                  <span class="text-slate-400">Following</span>
                </div>
              </div>
            </div>

            <!-- Right: Actions -->
            <div class="flex-shrink-0">
              <BaseButton variant="primary" size="sm" @click="openEditModal">
                Edit profile
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        <!-- ==================== QUICK STATS STRIP ==================== -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <!-- Posts -->
          <div class="stat-card">
            <div class="flex items-center gap-2 mb-1">
              <BaseIcon name="ChatBubbleLeftIcon" class="w-4 h-4 text-slate-400" />
              <span class="text-xs text-slate-500 font-medium">Posts</span>
            </div>
            <p class="text-xl font-semibold text-slate-900">{{ postsCount }}</p>
            <p v-if="postsCount === 0" class="text-xs text-slate-400 mt-0.5">No posts yet</p>
          </div>

          <!-- Bookmarks -->
          <div class="stat-card">
            <div class="flex items-center gap-2 mb-1">
              <BaseIcon name="BookmarkIcon" class="w-4 h-4 text-slate-400" />
              <span class="text-xs text-slate-500 font-medium">Bookmarks</span>
            </div>
            <p class="text-xl font-semibold text-slate-900">{{ bookmarksCount }}</p>
            <p v-if="bookmarksCount === 0" class="text-xs text-slate-400 mt-0.5">None saved</p>
          </div>

          <!-- Member Since (de-emphasized) -->
          <div class="stat-card stat-card--secondary">
            <div class="flex items-center gap-2 mb-1">
              <BaseIcon name="CalendarIcon" class="w-4 h-4 text-slate-300" />
              <span class="text-xs text-slate-400 font-medium">Member Since</span>
            </div>
            <p class="text-sm font-medium text-slate-600">{{ formatMemberSince(user.createdAt) }}</p>
          </div>

          <!-- Last Active (de-emphasized) -->
          <div class="stat-card stat-card--secondary">
            <div class="flex items-center gap-2 mb-1">
              <BaseIcon name="ClockIcon" class="w-4 h-4 text-slate-300" />
              <span class="text-xs text-slate-400 font-medium">Last Active</span>
            </div>
            <p class="text-sm font-medium text-slate-600">
              {{ recentPosts[0]?.createdAt ? formatRelativeTime(recentPosts[0].createdAt) : '–' }}
            </p>
            <p v-if="recentPosts.length === 0" class="text-xs text-slate-400 mt-0.5">No activity</p>
          </div>
        </div>

        <!-- ==================== RECENT ACTIVITY ==================== -->
        <BaseCard class="!p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-semibold text-slate-900">Recent Activity</h2>
            <span v-if="recentPosts.length > 0" class="text-xs text-slate-400">
              {{ recentPosts.length === 1 ? 'Latest post' : `Last ${recentPosts.length} posts` }}
            </span>
          </div>

          <!-- Posts list -->
          <div v-if="recentPosts.length > 0" class="space-y-2">
            <div
              v-for="post in recentPosts"
              :key="post.id"
              class="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50/60 hover:bg-slate-100/60 transition-colors cursor-pointer"
              @click="goToPost(post)"
            >
              <UserAvatar
                v-if="profileImageSrc"
                :src="profileImageSrc"
                class="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <UserAvatar v-else class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 truncate">{{ post.subject }}</p>
                <p class="text-xs text-slate-500 line-clamp-1">{{ post.content }}</p>
                <div class="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span>{{ formatRelativeTime(post.createdAt) }}</span>
                  <span class="flex items-center gap-1">
                    <BaseIcon name="HeartIcon" class="w-3 h-3" />
                    {{ post.likeCount }}
                  </span>
                  <span class="flex items-center gap-1">
                    <BaseIcon name="ChatBubbleLeftIcon" class="w-3 h-3" />
                    {{ post.commentCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-6">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <BaseIcon name="PencilSquareIcon" class="w-6 h-6 text-slate-400" />
            </div>
            <p class="text-sm text-slate-600 mb-1">No activity yet</p>
            <p class="text-xs text-slate-400 mb-4">Share what you've been learning!</p>
            <BaseButton variant="primary" size="sm" @click="goToHome">
              Write your first update
            </BaseButton>
          </div>
        </BaseCard>

      </div>

      <!-- NO USER -->
      <div v-else class="text-center py-8">
        <p class="text-sm text-slate-500">No user data available</p>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <EditProfileModal
      v-model="showEditModal"
      :user="user"
      @saved="onProfileSaved"
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

/* Stat card styling */
.stat-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  padding: 12px 14px;
  transition: all 0.15s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(203, 213, 225, 0.9);
}

/* Secondary stat cards (de-emphasized) */
.stat-card--secondary {
  background: rgba(248, 250, 252, 0.6);
  border-color: rgba(226, 232, 240, 0.5);
}

.stat-card--secondary:hover {
  background: rgba(248, 250, 252, 0.8);
}

/* Ambient mode stat cards */
.content-glass-container.ambient-mode .stat-card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>
