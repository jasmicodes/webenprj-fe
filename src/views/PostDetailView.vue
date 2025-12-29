<script setup lang="ts">
defineOptions({ name: 'PostDetailView' })

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseCard from '@/components/atoms/BaseCard.vue'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import BaseProgressRing from '@/components/atoms/BaseProgressRing.vue'
import PostHeader from '@/components/molecules/PostHeader.vue'
import PostFooter from '@/components/molecules/PostFooter.vue'
import CommentBox from '@/components/molecules/CommentBox.vue'
import CommentItem from '@/components/molecules/CommentItem.vue'
import PostEditModal from '@/components/molecules/PostEditModal.vue'
import PostDeleteModal from '@/components/molecules/PostDeleteModal.vue'
import type { PostCardData } from '@/utils/postMapper'
import { mapApiPostToCard } from '@/utils/postMapper'
import { postsApi } from '@/services/api/posts'
import { bookmarksApi } from '@/services/api/bookmarks'
import { useMediaImage } from '@/composables/useMediaImage'
import { useToastStore } from '@/stores/toastStore'
import { useUserStore } from '@/stores/userStore'
import { prepareTagForBackend } from '@/utils/tagUtils'
import fallbackAvatar from '@/assets/user1.avif'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const userStore = useUserStore()

// Post state
const post = ref<PostCardData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Comments state
const comments = ref<PostCardData[]>([])
const commentsLoading = ref(false)
const commentPage = ref(0)
const hasMoreComments = ref(false)
const newCommentText = ref('')

// Edit/Delete modals
const showEditModal = ref(false)
const editModalData = ref({ content: '', subject: '' })
const isSavingEdit = ref(false)
const showDeleteModal = ref(false)
const isDeleting = ref(false)

// Avatar for post author
const avatarSrc = computed(() => post.value?.user.avatar)
const { imageUrl: resolvedAvatarSrc } = useMediaImage(avatarSrc, fallbackAvatar)

// Check if current user owns this post
const isOwnPost = computed(() =>
  Boolean(userStore.user?.id && post.value?.userId === userStore.user.id)
)

// Fetch the post
async function loadPost() {
  const postId = route.params.id as string
  if (!postId) {
    error.value = 'Post ID not provided'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const apiPost = await postsApi.getPostById(postId)
    post.value = mapApiPostToCard(apiPost)
    // Load comments after post loads
    await loadComments()
  } catch (err) {
    console.error('Failed to load post:', err)
    error.value = 'Failed to load post'
  } finally {
    loading.value = false
  }
}

// Load comments
async function loadComments(reset = false) {
  if (!post.value) return

  if (reset) {
    commentPage.value = 0
    comments.value = []
  }

  commentsLoading.value = true
  try {
    const result = await postsApi.getComments(String(post.value.id), commentPage.value, 10)
    const mapped = result.content.map((p) => mapApiPostToCard(p))
    comments.value = reset ? mapped : [...comments.value, ...mapped]
    hasMoreComments.value = commentPage.value + 1 < result.totalPages
  } catch (err) {
    console.error('Failed to load comments:', err)
  } finally {
    commentsLoading.value = false
  }
}

// Load more comments
async function loadMoreComments() {
  commentPage.value++
  await loadComments()
}

// Submit new comment
async function submitComment() {
  if (!newCommentText.value.trim() || !post.value) return

  try {
    const created = await postsApi.createComment(String(post.value.id), {
      subject: post.value.tag || 'general',
      content: newCommentText.value.trim(),
    })
    const mapped = mapApiPostToCard(created)
    comments.value = [mapped, ...comments.value]
    newCommentText.value = ''
    post.value.comments++
  } catch (err) {
    console.error('Failed to create comment:', err)
    toastStore.showError('Failed to post comment', 'Comment')
  }
}

// Handle comment like
async function handleCommentLike(comment: PostCardData) {
  try {
    if (comment.liked) {
      await postsApi.unlikePost(String(comment.id))
      comment.liked = false
      comment.likes--
    } else {
      await postsApi.likePost(String(comment.id))
      comment.liked = true
      comment.likes++
    }
  } catch (err) {
    console.error('Failed to toggle comment like:', err)
  }
}

// Like post
async function toggleLike() {
  if (!post.value) return

  const original = { ...post.value }
  post.value.liked = !post.value.liked
  post.value.likes += post.value.liked ? 1 : -1

  try {
    if (post.value.liked) {
      await postsApi.likePost(String(post.value.id))
    } else {
      await postsApi.unlikePost(String(post.value.id))
    }
  } catch (err) {
    post.value = original
    toastStore.showError('Failed to update like', 'Like')
  }
}

// Bookmark post
async function toggleBookmark() {
  if (!post.value) return

  const original = { ...post.value }
  post.value.bookmarked = !post.value.bookmarked
  post.value.bookmarkCount += post.value.bookmarked ? 1 : -1

  try {
    if (post.value.bookmarked) {
      await bookmarksApi.createBookmark(String(post.value.id))
    } else {
      await bookmarksApi.deleteBookmark(String(post.value.id))
    }
  } catch (err) {
    post.value = original
    toastStore.showError('Failed to update bookmark', 'Bookmark')
  }
}

// Share post
function handleShare() {
  const url = window.location.href
  navigator.clipboard.writeText(url)
  toastStore.showSuccess('Link copied to clipboard', 'Share')
}

// Edit post
function openEditModal() {
  if (!post.value) return
  editModalData.value = {
    content: post.value.text || '',
    subject: post.value.tag || 'general',
  }
  showEditModal.value = true
}

async function handleSaveEdit(payload: { content: string; subject: string }) {
  if (!post.value) return

  isSavingEdit.value = true
  try {
    const updated = await postsApi.updatePost(String(post.value.id), {
      content: payload.content,
      subject: prepareTagForBackend(payload.subject),
    })
    post.value = mapApiPostToCard(updated)
    showEditModal.value = false
    toastStore.showSuccess('Post updated', 'Success')
  } catch (err) {
    toastStore.showError('Failed to update post', 'Update')
  } finally {
    isSavingEdit.value = false
  }
}

// Delete post
function openDeleteModal() {
  showDeleteModal.value = true
}

async function handleConfirmDelete() {
  if (!post.value) return

  isDeleting.value = true
  try {
    await postsApi.deletePost(String(post.value.id))
    showDeleteModal.value = false
    toastStore.showSuccess('Post deleted', 'Success')
    router.push({ name: 'home' })
  } catch (err) {
    toastStore.showError('Failed to delete post', 'Delete')
  } finally {
    isDeleting.value = false
  }
}

// Go back
function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}

onMounted(() => {
  loadPost()
})
</script>

<template>
  <main class="min-h-screen flex items-start justify-center px-4 sm:px-8">
    <div class="w-full max-w-3xl py-8">
      <!-- Back button -->
      <button
        @click="goBack"
        class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </button>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-12">
        <BaseProgressRing :size="48" :progress="0" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <BaseIcon name="ExclamationTriangleIcon" class="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p class="text-red-600 mb-4">{{ error }}</p>
        <BaseButton @click="loadPost">Retry</BaseButton>
      </div>

      <!-- Post content -->
      <template v-else-if="post">
        <BaseCard size="lg" class="mb-6">
          <template #header>
            <PostHeader
              :username="post.user.name"
              :avatar-src="resolvedAvatarSrc"
              :tag="post.tag"
              :time="post.time"
            />
          </template>

          <!-- Post body -->
          <div class="space-y-3">
            <!-- Image -->
            <figure
              v-if="post.image"
              class="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden rounded-xl"
            >
              <img
                :src="post.image"
                alt="Post image"
                class="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </figure>

            <!-- Text content -->
            <p v-if="post.text" class="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
              {{ post.text }}
            </p>
          </div>

          <template #actions>
            <PostFooter
              :likes="post.likes"
              :liked="post.liked"
              :comments="post.comments"
              :streak="post.streak"
              :bookmark-count="post.bookmarkCount"
              :bookmarked="post.bookmarked"
              :is-own-post="isOwnPost"
              :is-admin="userStore.isAdmin"
              @like="toggleLike"
              @comment="() => {}"
              @save="toggleBookmark"
              @share="handleShare"
              @edit="openEditModal"
              @delete="openDeleteModal"
            />
          </template>
        </BaseCard>

        <!-- Comments section -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <h2 class="text-sm font-medium text-slate-700 mb-4">
            Comments
            <span v-if="post.comments > 0" class="text-slate-400 font-normal">
              ({{ post.comments }})
            </span>
          </h2>

          <!-- Comment input -->
          <div class="mb-6">
            <CommentBox
              v-model="newCommentText"
              placeholder="Write a comment..."
              @send="submitComment"
            />
          </div>

          <!-- Comments loading -->
          <div v-if="commentsLoading && comments.length === 0" class="flex justify-center py-6">
            <BaseProgressRing :size="24" :progress="0" />
          </div>

          <!-- Comments list -->
          <div v-else-if="comments.length > 0" class="space-y-4">
            <CommentItem
              v-for="comment in comments"
              :key="comment.id"
              :comment="comment"
              @like="handleCommentLike(comment)"
            />

            <!-- Load more -->
            <div v-if="hasMoreComments" class="flex justify-center pt-2">
              <BaseButton
                variant="ghost"
                size="sm"
                :disabled="commentsLoading"
                @click="loadMoreComments"
              >
                {{ commentsLoading ? 'Loading...' : 'Load more comments' }}
              </BaseButton>
            </div>
          </div>

          <!-- Empty comments -->
          <div v-else class="text-center py-6 text-sm text-slate-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        </div>
      </template>
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

  <!-- Delete Modal -->
  <PostDeleteModal
    :show="showDeleteModal"
    :is-deleting="isDeleting"
    @close="showDeleteModal = false"
    @confirm="handleConfirmDelete"
  />
</template>
