<script setup lang="ts">
defineOptions({ name: 'HomeView' })

import { ref, onMounted, computed } from 'vue'
import { isAxiosError } from 'axios'
import PostCard from '@/components/organisms/PostCard.vue'
import ComposerCard from '@/components/organisms/ComposerCard.vue'
import PostEditModal from '@/components/molecules/PostEditModal.vue'
import PostDeleteModal from '@/components/molecules/PostDeleteModal.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import PageHeader from '@/components/atoms/PageHeader.vue'
import type { PostCardData } from '@/utils/postMapper'
import { mapApiPostToCard } from '@/utils/postMapper'
import { postsApi, mediaApi } from '@/services/api'
import { bookmarksApi } from '@/services/api/bookmarks'
import { usersApi } from '@/services/api/users'
import { useToastStore } from '@/stores/toastStore'
import { getErrorMessage } from '@/services/api/client'
import { useUserStore } from '@/stores/userStore'
import { useAppearanceStore } from '@/stores/appearanceStore'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { prepareTagForBackend } from '@/utils/tagUtils'

const posts = ref<PostCardData[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const page = ref(0)
const totalPages = ref(1)
const pageSize = 10
const toastStore = useToastStore()
const userStore = useUserStore()
const filter = ref<'all' | 'following'>('following')

// Ambient mode detection
const appearanceStore = useAppearanceStore()
const isMobile = useMediaQuery('(max-width: 768px)')
const isAmbientMode = computed(() => appearanceStore.bgEnabled && !isMobile.value)

// Edit/Delete state
const editingPostId = ref<string | null>(null)
const editModalData = ref({ content: '', subject: '' })
const showEditModal = ref(false)
const isSavingEdit = ref(false)

const deletingPostId = ref<string | null>(null)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Gentle progress presence: Check if current user posted today (server-side)
const hasPostedToday = ref(false)

async function checkHasPostedToday() {
  if (!userStore.user?.id) {
    hasPostedToday.value = false
    return
  }
  try {
    const activity = await usersApi.getActivity()
    hasPostedToday.value = activity.hasPostedToday
  } catch {
    // Silently fail - just show as not posted
    hasPostedToday.value = false
  }
}

const dailyStatusMessage = computed(() => {
  return hasPostedToday.value
    ? "You've shared an update today"
    : 'No update yet today'
})

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

  try {
    const result = await postsApi.getAllPosts(undefined, page.value, pageSize, filter.value)
    const mapped = result.content.map((post) => mapApiPostToCard(post))
    posts.value = reset ? mapped : [...posts.value, ...mapped]
    totalPages.value = result.totalPages
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = getErrorMessage(err)
    }
    toastStore.showError(error.value ?? 'Failed to load posts', 'Feed')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (page.value + 1 >= totalPages.value) return
  page.value += 1
  loadPosts().catch(() => {
    // Error already handled in loadPosts, but explicit catch avoids unhandled rejection
  })
}

function retry() {
  error.value = null
  loadPosts(true).catch(() => {
    // Error already handled in loadPosts
  })
}

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
  } catch (err: unknown) {
    posts.value[idx] = original
    const message = err instanceof Error ? err.message : 'Failed to update like'
    toastStore.showError(message, 'Like')
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
  } catch (err: unknown) {
    posts.value[idx] = original
    const message = err instanceof Error ? err.message : 'Failed to update bookmark'
    toastStore.showError(message, 'Bookmark')
  }
}

async function handleCreatePost(payload: { subject: string; content: string; file: File | null }) {
  try {
    let imageUrl: string | undefined

    // Upload media if provided
    if (payload.file) {
      const media = await mediaApi.upload(payload.file)
      imageUrl = `/medias/${media.id}`
    }

    // Create post - payload now matches PostCreateRequest exactly
    const newPost = await postsApi.createPost({
      subject: payload.subject, // Backend requires 'subject' (not 'tag')
      content: payload.content, // Content validated in composer (10-500 chars)
      imageUrl, // Optional, validated pattern already passed
    })

    // Add new post to the top of the feed
    const mapped = mapApiPostToCard(newPost)
    posts.value = [mapped, ...posts.value]

    // Update "posted today" status
    hasPostedToday.value = true

    // Show success message
    toastStore.showSuccess('Reflection shared', 'Success')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create post'
    toastStore.showError(message, 'Create Post')
  }
}

function openEditModal(postId: PostCardData['id']) {
  const post = posts.value.find((p) => p.id === postId)
  if (!post) return

  editingPostId.value = String(postId)
  editModalData.value = {
    content: post.text || '',
    subject: post.tag || 'general',
  }
  showEditModal.value = true
}

async function handleSaveEdit(payload: { content: string; subject: string }) {
  if (!editingPostId.value) return

  isSavingEdit.value = true
  try {
    const updatedPost = await postsApi.updatePost(editingPostId.value, {
      content: payload.content,
      subject: prepareTagForBackend(payload.subject),
    })

    // Update post in local state
    const idx = posts.value.findIndex((p) => p.id === editingPostId.value)
    if (idx !== -1) {
      posts.value[idx] = mapApiPostToCard(updatedPost)
    }

    showEditModal.value = false
    toastStore.showSuccess('Reflection updated', 'Success')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update post'
    toastStore.showError(message, 'Update Post')
  } finally {
    isSavingEdit.value = false
  }
}

function openDeleteModal(postId: PostCardData['id']) {
  deletingPostId.value = String(postId)
  showDeleteModal.value = true
}

async function handleConfirmDelete() {
  if (!deletingPostId.value) return

  isDeleting.value = true
  try {
    await postsApi.deletePost(deletingPostId.value)

    // Remove from local state
    posts.value = posts.value.filter((p) => p.id !== deletingPostId.value)

    showDeleteModal.value = false
    toastStore.showSuccess('Reflection deleted', 'Success')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete post'
    toastStore.showError(message, 'Delete Post')
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  loadPosts(true).catch(() => {
    // Error already handled in loadPosts
  })
  checkHasPostedToday()
})
</script>

<template>
  <main class="min-h-screen flex items-start justify-center px-8">
    <div
      class="w-full max-w-3xl py-8 content-glass-container"
      :class="{ 'ambient-mode': isAmbientMode }"
    >
      <!-- Feed Header -->
      <PageHeader title="Today's Workbench" subtitle="Your daily study reflections">
        <!-- Gentle progress presence (non-gamified, calm) -->
        <div
          v-if="!loading"
          class="text-xs font-medium px-2.5 py-1 rounded-md flex-shrink-0 transition-colors"
          :class="
            hasPostedToday
              ? 'text-emerald-600 bg-emerald-50/80 border border-emerald-100'
              : 'text-slate-400 bg-slate-50/60 border border-slate-100'
          "
        >
          {{ dailyStatusMessage }}
        </div>
      </PageHeader>

      <!-- Composer Card -->
      <div class="mb-6">
        <ComposerCard @post="handleCreatePost" />
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-6">
        <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-lg p-6 animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-300 rounded w-full mb-1"></div>
          <div class="h-3 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600">Failed to load posts: {{ error }}</p>
        <BaseButton class="mt-3" @click="retry">Retry</BaseButton>
      </div>

      <!-- Empty state (calm and welcoming) -->
      <div v-else-if="posts.length === 0" class="text-center py-12">
        <p class="text-slate-600 text-sm">Your study reflections will appear here.</p>
        <p class="text-slate-500 text-xs mt-2">Start by sharing what you're learning today.</p>
      </div>

      <!-- Posts -->
      <div v-else class="space-y-6">
        <PostCard
          v-for="p in posts"
          :key="p.id"
          :post="p"
          :current-user-id="userStore.user?.id"
          @like="toggleLike"
          @save="toggleBookmark"
          @edit="openEditModal"
          @delete="openDeleteModal"
        />

        <!-- Load more button -->
        <div v-if="page + 1 < totalPages" class="flex justify-center pt-2">
          <BaseButton :disabled="loadingMore" @click="loadMore">
            <span v-if="loadingMore">Loading...</span>
            <span v-else>Load more</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </main>

  <!-- Edit Modal -->
  <PostEditModal
    :show="showEditModal"
    :content="editModalData.content"
    :subject="editModalData.subject"
    :is-saving="isSavingEdit"
    @close="showEditModal = false"
    @save="handleSaveEdit"
  />

  <!-- Delete Confirmation Modal -->
  <PostDeleteModal
    :show="showDeleteModal"
    :is-deleting="isDeleting"
    @close="showDeleteModal = false"
    @confirm="handleConfirmDelete"
  />
</template>

<style scoped>
/**
 * Feed column container
 * Clean mode: minimal styling
 * Ambient mode: premium glass panel that frames the content
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
